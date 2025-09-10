"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useActions } from "@/contexts/actions"
import { Toaster } from "@/components/ui/sonner"
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notifications"
import {
  createLeafNode,
  deserializeDivision,
  divideNode,
  enumerateLeafSubnetsWithParents,
  inetNtoa,
  joinNode,
  serializeDivision,
  createExportState,
  exportAsJsonBlob,
  exportAsCsvBlob,
  triggerDownload,
  importFromFile,
  updateNodeAggregates,
  validateNetworkAndMask,
} from "@/lib/networking/subnetting/utils"

export default function SubnettingPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { setActions } = useActions();

  const [networkInput, setNetworkInput] = React.useState(search.get("network") || "192.168.0.0");
  const [maskInput, setMaskInput] = React.useState(search.get("mask") || "16");
  const [baseNetwork, setBaseNetwork] = React.useState(0);
  const [baseMask, setBaseMask] = React.useState(0);
  const [root, setRoot] = React.useState(createLeafNode());

  const [visible, setVisible] = React.useState({
    netmask: false,
    range: true,
    useable: true,
    hosts: true,
  });

  // Load from query on first mount
  React.useEffect(() => {
    const division = search.get("division");
    const maskStr = search.get("mask");
    const netStr = search.get("network");
    if (netStr && maskStr) {
      const { network, mask, error } = validateNetworkAndMask(netStr, maskStr);
      if (error) {
        notifyError(error);
        return;
      }
      setBaseNetwork(network);
      setBaseMask(mask);
      setNetworkInput(inetNtoa(network));
      setMaskInput(String(mask));
      if (division) {
        const newRoot = deserializeDivision(division);
        setRoot(newRoot);
      } else {
        setRoot(createLeafNode());
      }
    } else {
      // initialize defaults
      const { network, mask } = validateNetworkAndMask(networkInput, maskInput);
      setBaseNetwork(network);
      setBaseMask(mask);
      setRoot(createLeafNode());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    updateNodeAggregates(root);
  }, [root]);

  const { rows, parentMap } = React.useMemo(() => {
    return enumerateLeafSubnetsWithParents(root, baseNetwork, baseMask);
  }, [root, baseNetwork, baseMask]);

  function applyAndMaybeReset() {
    const { network, mask, error, changed } = validateNetworkAndMask(networkInput, maskInput);
    if (error) {
      notifyError(error);
      return;
    }
    const networkChanged = network !== baseNetwork;
    const maskChanged = mask !== baseMask;
    let nextRoot = root;
    if (maskChanged) {
      nextRoot = createLeafNode();
      setRoot(nextRoot);
    }
    if (networkChanged || maskChanged || changed) {
      setBaseNetwork(network);
      setBaseMask(mask);
      setNetworkInput(inetNtoa(network));
      notifyInfo("Network updated", { description: `${inetNtoa(network)}/${mask}` });
    }
    syncQuery(network, mask, nextRoot);
  }

  function syncQuery(network, mask, currentRoot) {
    const params = new URLSearchParams();
    params.set("network", inetNtoa(network));
    params.set("mask", String(mask));
    params.set("division", serializeDivision(currentRoot));
    router.replace(`?${params.toString()}`);
  }

  function onDivide(node) {
    divideNode(node);
    const newRoot = { ...root };
    updateNodeAggregates(newRoot);
    setRoot(newRoot);
    syncQuery(baseNetwork, baseMask, newRoot);
  }

  function onJoin(node) {
    const parent = parentMap.get(node);
    if (parent) {
      joinNode(parent);
    } else {
      joinNode(node);
    }
    const newRoot = { ...root };
    updateNodeAggregates(newRoot);
    setRoot(newRoot);
    syncQuery(baseNetwork, baseMask, newRoot);
  }

  const actions = React.useMemo(() => ([
    {
      key: "import",
      label: "Import",
      variant: "outline",
      size: "sm",
      onClick: async () => {
        try {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json,.csv";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
              const { network, mask, root: importedRoot } = await importFromFile(file);
              if (network == null || Number.isNaN(mask)) throw new Error("Invalid import data");
              setBaseNetwork(network);
              setBaseMask(mask);
              setNetworkInput(inetNtoa(network));
              setMaskInput(String(mask));
              setRoot(importedRoot);
              updateNodeAggregates(importedRoot);
              syncQuery(network, mask, importedRoot);
              notifySuccess("Imported configuration applied");
            } catch (e) {
              notifyError(e?.message || "Failed to import file");
            }
          };
          input.click();
        } catch {
          notifyError("Import not supported");
        }
      },
    },
    {
      key: "export",
      type: "split-dropdown",
      label: "Export",
      variant: "outline",
      size: "sm",
      onClick: () => {
        const state = createExportState({ network: baseNetwork, mask: baseMask, rootNode: root, rows });
        const blob = exportAsJsonBlob(state);
        triggerDownload({ blob, filename: `subnetting-${inetNtoa(baseNetwork)}-${baseMask}.json` });
      },
      menu: [
        {
          key: "export-json",
          label: "JSON",
          onClick: () => {
            const state = createExportState({ network: baseNetwork, mask: baseMask, rootNode: root, rows });
            const blob = exportAsJsonBlob(state);
            triggerDownload({ blob, filename: `subnetting-${inetNtoa(baseNetwork)}-${baseMask}.json` });
          },
        },
        {
          key: "export-csv",
          label: "CSV",
          onClick: () => {
            const state = createExportState({ network: baseNetwork, mask: baseMask, rootNode: root, rows });
            const blob = exportAsCsvBlob(state);
            triggerDownload({ blob, filename: `subnetting-${inetNtoa(baseNetwork)}-${baseMask}.csv` });
          },
        },
      ],
    },
    {
      key: "share",
      label: "Share",
      variant: "outline",
      size: "sm",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          notifySuccess("Link copied to clipboard");
        } catch {
          notifyError("Failed to copy link");
        }
      },
    },
    {
      key: "apply",
      label: "Update",
      onClick: applyAndMaybeReset,
      variant: "default",
      size: "sm",
    },
    {
      key: "reset",
      label: "Reset",
      variant: "destructive",
      size: "sm",
      onClick: () => {
        setRoot(createLeafNode());
        syncQuery(baseNetwork, baseMask, createLeafNode());
      },
    },
  ]), [baseNetwork, baseMask, root, rows, networkInput, maskInput]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-4">
        <div className="grid gap-2">
          <Label htmlFor="network">Network Address</Label>
          <Input id="network" value={networkInput} onChange={(e) => setNetworkInput(e.target.value)} placeholder="192.168.0.0" className="w-44" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="netbits">Mask bits</Label>
          <div className="flex items-center gap-2">
            <span className="opacity-70">/</span>
            <Input id="netbits" value={maskInput} onChange={(e) => setMaskInput(e.target.value)} className="w-14" />
          </div>
        </div>
      </div>

      {/* Set global actions below breadcrumb */}
      {React.useEffect(() => {
        setActions(actions);
        return () => setActions([]);
      }, [actions, setActions])}

      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(visible).map(([key, val]) => (
          <label key={key} className="inline-flex items-center gap-2 text-sm">
            <Checkbox checked={val} onCheckedChange={(v) => setVisible((prev) => ({ ...prev, [key]: Boolean(v) }))} />
            <span className="capitalize">{key === "useable" ? "Useable" : key}</span>
          </label>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subnet address</TableHead>
              {visible.netmask && <TableHead>Netmask</TableHead>}
              {visible.range && <TableHead>Range of addresses</TableHead>}
              {visible.useable && <TableHead>Useable IPs</TableHead>}
              {visible.hosts && <TableHead>Hosts</TableHead>}
              <TableHead>Divide</TableHead>
              <TableHead>Join</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.address}-${row.mask}-${idx}`}>
                <TableCell>{row.subnetCidr}</TableCell>
                {visible.netmask && <TableCell>{row.netmask}</TableCell>}
                {visible.range && <TableCell>{row.addressRange}</TableCell>}
                {visible.useable && <TableCell>{row.usableRange}</TableCell>}
                {visible.hosts && <TableCell>{row.hostCount}</TableCell>}
                <TableCell>
                  <Button
                    size="sm"
                    variant={row.mask === 32 ? "ghost" : "outline"}
                    disabled={row.mask === 32}
                    onClick={() => onDivide(row.node)}
                  >
                    Divide
                  </Button>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="secondary" onClick={() => onJoin(row.node)}>
                    Join
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Toaster richColors position="bottom-center" />
    </div>
  );
}


