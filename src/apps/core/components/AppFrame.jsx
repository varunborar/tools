"use client";
import * as React from "react";
import AppMenubar from "@/apps/core/components/AppMenubar";
import AppTabs from "@/apps/core/components/AppTabs";
import { useApp } from "@/apps/core/context/AppProvider";

export default function AppFrame({ menus, onAction, renderInstance }) {
  const {
    instances,
    activeInstanceId,
    createInstance,
    closeInstance,
    renameInstance,
    setActiveInstance,
  } = useApp();

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 p-2">
      <AppMenubar menus={menus} onAction={onAction} />
      <AppTabs
        instances={instances}
        activeId={activeInstanceId}
        onCreate={() => createInstance()}
        onClose={closeInstance}
        onRename={renameInstance}
        onActivate={setActiveInstance}
        renderContent={(inst) => renderInstance(inst)}
      />
    </div>
  );
}
