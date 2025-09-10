"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@/lib/networking/subnetting/utils";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notifications";

export function useSubnetting() {
  const router = useRouter();
  const search = useSearchParams();

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

  const syncQuery = React.useCallback((network, mask, currentRoot) => {
    const params = new URLSearchParams();
    params.set("network", inetNtoa(network));
    params.set("mask", String(mask));
    params.set("division", serializeDivision(currentRoot));
    router.replace(`?${params.toString()}`);
  }, [router]);

  const applyAndMaybeReset = React.useCallback(() => {
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
  }, [networkInput, maskInput, baseNetwork, baseMask, root, setRoot, setBaseNetwork, setBaseMask, setNetworkInput, syncQuery]);

  const onDivide = React.useCallback((node) => {
    divideNode(node);
    const newRoot = { ...root };
    updateNodeAggregates(newRoot);
    setRoot(newRoot);
    syncQuery(baseNetwork, baseMask, newRoot);
  }, [root, baseNetwork, baseMask, setRoot, syncQuery]);

  const onJoin = React.useCallback((node) => {
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
  }, [parentMap, root, baseNetwork, baseMask, setRoot, syncQuery]);

  const handleImport = React.useCallback(async () => {
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
  }, [setBaseNetwork, setBaseMask, setNetworkInput, setMaskInput, setRoot, syncQuery]);

  const exportJson = React.useCallback(() => {
    const state = createExportState({ network: baseNetwork, mask: baseMask, rootNode: root, rows });
    const blob = exportAsJsonBlob(state);
    triggerDownload({ blob, filename: `subnetting-${inetNtoa(baseNetwork)}-${baseMask}.json` });
  }, [baseNetwork, baseMask, root, rows]);

  const exportCsv = React.useCallback(() => {
    const state = createExportState({ network: baseNetwork, mask: baseMask, rootNode: root, rows });
    const blob = exportAsCsvBlob(state);
    triggerDownload({ blob, filename: `subnetting-${inetNtoa(baseNetwork)}-${baseMask}.csv` });
  }, [baseNetwork, baseMask, root, rows]);

  const shareLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notifySuccess("Link copied to clipboard");
    } catch {
      notifyError("Failed to copy link");
    }
  }, []);

  const resetDivisions = React.useCallback(() => {
    const fresh = createLeafNode();
    setRoot(fresh);
    syncQuery(baseNetwork, baseMask, fresh);
  }, [baseNetwork, baseMask, setRoot, syncQuery]);

  return {
    // values
    networkInput,
    maskInput,
    baseNetwork,
    baseMask,
    rows,
    visible,
    // setters
    setNetworkInput,
    setMaskInput,
    setVisible,
    // actions
    applyAndMaybeReset,
    onDivide,
    onJoin,
    handleImport,
    exportJson,
    exportCsv,
    shareLink,
    resetDivisions,
  };
}


