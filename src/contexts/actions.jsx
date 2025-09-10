"use client";

import * as React from "react";

const ActionsContext = React.createContext(null);

export function useActions() {
  const ctx = React.useContext(ActionsContext);
  if (!ctx) throw new Error("useActions must be used within ActionsProvider");
  return ctx;
}

export function ActionsProvider({ children }) {
  const [actions, setActions] = React.useState([]);
  const value = React.useMemo(() => ({ actions, setActions }), [actions]);
  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
}


