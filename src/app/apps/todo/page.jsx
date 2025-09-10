"use client";
import * as React from "react";
import { AppProvider } from "@/apps/core/context/AppProvider";
import AppFrame from "@/apps/core/components/AppFrame";
import TodoEditor from "@/apps/todo/TodoEditor";
import { downloadJson, readJsonFromFile } from "@/apps/core/utils/exportImport";
import { useApp } from "@/apps/core/context/AppProvider";

function MenusWrapper({ children }) {
  const fileInputRef = React.useRef(null);
  const app = useApp();
  const editorRef = React.useRef(null);

  const menus = React.useMemo(() => ([
    {
      label: "File",
      items: [
        { id: "new-instance", label: "New" },
        { id: "import", label: "Import" },
        { id: "export", label: "Export" },
      ],
    },
    {
      label: "Edit",
      items: [
        { id: "add-todo", label: "Add Todo" },
      ],
    },
    {
      label: "Settings",
      items: [
        { id: "manage-statuses", label: "Manage Statuses" },
        { id: "manage-custom-fields", label: "Manage Custom Fields" },
      ],
    },
  ]), []);

  const onAction = React.useCallback(async (id) => {
    if (id === "new-instance") {
      app.createInstance({ settings: undefined, todos: [] });
      return;
    }
    if (id === "add-todo") {
      editorRef.current?.openAddTodo?.();
      return;
    }
    if (id === "manage-statuses") {
      editorRef.current?.openManageStatuses?.();
      return;
    }
    if (id === "manage-custom-fields") {
      editorRef.current?.openManageCustomFields?.();
      return;
    }
    if (id === "export") {
      const data = app.exportInstance(app.activeInstanceId);
      if (data) downloadJson(`todo-${app.activeInstanceId}.json`, data);
      return;
    }
    if (id === "import") {
      fileInputRef.current?.click();
      return;
    }
  }, [app]);

  // Bridge command-bar app commands via window events
  React.useEffect(() => {
    const handler = (e) => {
      const { appId, action } = e.detail || {};
      if (appId !== "todo") return;
      onAction(action);
    };
    window.addEventListener("app-command", handler);
    return () => window.removeEventListener("app-command", handler);
  }, [onAction]);

  const onPickFile = React.useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readJsonFromFile(file);
      // Import into a NEW instance (new tab) using the file's data
      app.importIntoInstance(undefined, json);
    } finally {
      e.target.value = "";
    }
  }, [app]);

  return (
    <>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={onPickFile} className="hidden" />
      <AppFrame menus={menus} onAction={onAction} renderInstance={(inst) => <TodoEditor ref={editorRef} instanceId={inst.id} />} />
      {children}
    </>
  );
}

export default function TodoAppPage() {
  return (
    <AppProvider appId="todo" schemaVersion="1" defaults={{ settings: { statuses: [
      { id: "open", label: "Open" },
      { id: "in-progress", label: "In Progress" },
      { id: "done", label: "Done" },
    ], customFields: [] }, todos: [] }}>
      <MenusWrapper />
    </AppProvider>
  );
}
