import { Terminal } from "lucide-react";

// Return a list of custom commands. To scope a command to one or more
// workspaces, provide `workspaces: ["Workspace Name", ...]`.
// If `workspaces` is omitted or empty, the command shows in all workspaces.
export function getCustomCommands({ redirectTo, setOpen, activeWorkspace }) {
  const commands = [
    {
      id: "home",
      label: "Go to Home",
      icon: Terminal,
      shortcut: "G H",
      run: () => redirectTo("/")
    },
    {
      id: "ws-settings",
      label: "Open Workspace Settings",
      icon: Terminal,
      run: () => redirectTo("/settings")
    },
  ];

  // Filter here as a convenience as well. The caller also filters.
  const activeName = activeWorkspace?.name;
  return commands.filter((cmd) => !cmd.workspaces || cmd.workspaces.length === 0 || cmd.workspaces.includes(activeName));
}


