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
        { id: "new-instance", label: "New", shortcut: "⌘N" },
        { id: "import", label: "Import…", shortcut: "⌘O" },
        { id: "export", label: "Export…", shortcut: "⌘S" },
      ],
    },
    {
      label: "Edit",
      items: [
        { id: "add-todo", label: "Add Todo", shortcut: "⌘T" },
      ],
    },
    {
      label: "Settings",
      items: [
        { id: "add-status", label: "Add Status" },
        { id: "add-custom-field", label: "Add Custom Field" },
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
    if (id === "add-status") {
      editorRef.current?.addStatus?.();
      return;
    }
    if (id === "add-custom-field") {
      editorRef.current?.addCustomField?.();
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

  const onPickFile = React.useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readJsonFromFile(file);
      app.importIntoInstance(app.activeInstanceId, json);
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
