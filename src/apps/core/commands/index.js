import { Terminal } from "lucide-react";

export function getAppCommands({ pathname, setOpen }) {
  const cmds = [];
  const close = () => setOpen?.(false);

  // To Do app commands
  if (typeof pathname === "string" && pathname.startsWith("/apps/todo")) {
    const appId = "todo";
    const emit = (action) => {
      try {
        window.dispatchEvent(new CustomEvent("app-command", { detail: { appId, action } }));
        close();
      } catch {}
    };
    const prefix = "To Do";
    cmds.push(
      { id: "todo:add", label: `${prefix}: Add Todo`, icon: Terminal, run: () => emit("add-todo") },
      { id: "todo:manage-statuses", label: `${prefix}: Manage Statuses`, icon: Terminal, run: () => emit("manage-statuses") },
      { id: "todo:manage-fields", label: `${prefix}: Manage Custom Fields`, icon: Terminal, run: () => emit("manage-custom-fields") },
      { id: "todo:new", label: `${prefix}: New Tab`, icon: Terminal, run: () => emit("new-instance") },
      { id: "todo:import", label: `${prefix}: Import File`, icon: Terminal, run: () => emit("import") },
      { id: "todo:export", label: `${prefix}: Export File`, icon: Terminal, run: () => emit("export") },
    );
  }

  return cmds;
}
