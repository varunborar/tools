"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useActions } from "@/contexts/actions"
import { useSubnetting } from "@/hooks/networking/use-subnetting"
import { Toaster } from "@/components/ui/sonner"
import {
  createLeafNode
} from "@/lib/networking/subnetting/utils"

export default function SubnettingPage() {
  const { setActions } = useActions();
  const {
    networkInput,
    maskInput,
    baseNetwork,
    baseMask,
    rows,
    visible,
    setNetworkInput,
    setMaskInput,
    setVisible,
    applyAndMaybeReset,
    onDivide,
    onJoin,
    handleImport,
    exportJson,
    exportCsv,
    shareLink,
    resetDivisions,
  } = useSubnetting();


  const actions = React.useMemo(() => ([
    { key: "import", label: "Import", variant: "outline", size: "sm", onClick: handleImport },
    {
      key: "export",
      type: "split-dropdown",
      label: "Export",
      variant: "outline",
      size: "sm",
      onClick: exportJson,
      menu: [
        { key: "export-json", label: "JSON", onClick: exportJson },
        { key: "export-csv", label: "CSV", onClick: exportCsv },
      ],
    },
    { key: "share", label: "Share", variant: "outline", size: "sm", onClick: shareLink },
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
      onClick: resetDivisions,
    },
  ]), [handleImport, exportJson, exportCsv, shareLink, applyAndMaybeReset, resetDivisions]);

  React.useEffect(() => {
    setActions(actions);
    return () => setActions([]);
  }, [actions, setActions]);

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

      {/* Actions are provided globally via ActionsProvider; see useEffect above */}

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


