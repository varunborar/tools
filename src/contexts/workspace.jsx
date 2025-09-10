"use client";

import * as React from "react";
import navConfig from "@/config/navigation.json" assert { type: "json" };

const WorkspaceContext = React.createContext(null);

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children, initialIndex = 0 }) {
  const STORAGE_INDEX = "active_workspace_index";
  const STORAGE_NAME = "active_workspace_name";

  const getIndexByName = (name) => {
    if (!name) return -1;
    const list = (navConfig.workspaces ?? []).map((w) => w.name.toLowerCase());
    return list.indexOf(String(name).toLowerCase());
  };

  const getInitialIndex = () => {
    const total = (navConfig.workspaces ?? []).length;
    const clamp = (idx) => {
      if (total <= 0) return 0;
      if (Number.isNaN(idx) || idx == null) return 0;
      return Math.max(0, Math.min(idx, total - 1));
    };
    if (typeof window === "undefined") return initialIndex;
    try {
      // Try to infer from current path's base segment
      const pathname = window.location.pathname || "/";
      const firstSeg = pathname.split("/").filter(Boolean)[0] || "";
      if (firstSeg) {
        const idxByBase = (navConfig.workspaces ?? []).findIndex((w) => {
          const base = (w.basePath || "").replace(/^\//, "").split("/")[0];
          return base && base.toLowerCase() === firstSeg.toLowerCase();
        });
        if (idxByBase >= 0) return clamp(idxByBase);
      }
      const storedName = window.localStorage.getItem(STORAGE_NAME);
      if (storedName) {
        const idx = getIndexByName(storedName);
        if (idx >= 0) return clamp(idx);
      }
      const storedIdx = parseInt(window.localStorage.getItem(STORAGE_INDEX) ?? "", 10);
      if (!Number.isNaN(storedIdx)) return clamp(storedIdx);
    } catch {}
    return clamp(initialIndex);
  };

  const [activeIndex, setActiveIndex] = React.useState(getInitialIndex);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const total = (navConfig.workspaces ?? []).length;
      if (total > 0 && (activeIndex < 0 || activeIndex > total - 1)) {
        setActiveIndex(0);
        return;
      }
      const name = navConfig.workspaces?.[activeIndex]?.name;
      window.localStorage.setItem(STORAGE_INDEX, String(activeIndex));
      if (name) window.localStorage.setItem(STORAGE_NAME, name);
    } catch {}
  }, [activeIndex]);

  const value = React.useMemo(() => ({ activeIndex, setActiveIndex }), [activeIndex]);

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}


