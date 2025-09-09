"use client";

import * as React from "react";

const WorkspaceContext = React.createContext(null);

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children, initialIndex = 0 }) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const value = React.useMemo(() => ({ activeIndex, setActiveIndex }), [activeIndex]);

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}


