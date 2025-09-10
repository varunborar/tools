"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import navConfig from "@/config/navigation.json" assert { type: "json" };
import { useWorkspace } from "@/contexts/workspace";
import { getLucideIconByName } from "@/lib/icon-map";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

// Pluggable custom commands
import { getCustomCommands } from "@/commands/custom-commands";
import { getAppCommands } from "@/apps/core/commands";

export function CommandBar() {
  const router = useRouter();
  const { activeIndex } = useWorkspace();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Toggle with Cmd/Ctrl+M
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const redirectTo = React.useCallback(
    (href) => {
      if (!href) return;
      const ws = (navConfig.workspaces ?? [])[activeIndex];
      const basePath = ws?.basePath ?? "";
      const prefixed = `${basePath || ""}${href.startsWith("/") ? href : `/${href}`}`;
      setOpen(false);
      router.push(prefixed);
    },
    [router, activeIndex]
  );

  // Build redirect feature commands from the active workspace only
  const navCommands = React.useMemo(() => {
    const ws = (navConfig.workspaces ?? [])[activeIndex];
    if (!ws) return [];
    const results = [];
    for (const section of ws.sections ?? []) {
      for (const svc of section.services ?? []) {
        const SvcIcon = getLucideIconByName(svc.icon);
        for (const feat of svc.features ?? []) {
          results.push({ id: `feat:${feat.href}`, label: `${feat.title}`, icon: SvcIcon, run: () => redirectTo(feat.href) });
        }
      }
    }
    return results;
  }, [activeIndex, redirectTo]);

  // Prepare filtered custom commands for active workspace
  const ws = (navConfig.workspaces ?? [])[activeIndex];
  const customCommands = React.useMemo(() => getCustomCommands({ redirectTo, setOpen, activeWorkspace: ws }), [redirectTo, setOpen, ws]);
  const appCommands = React.useMemo(() => getAppCommands({ pathname, setOpen }), [pathname, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Bar" description="Search commands">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Features">
          {navCommands.map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.run}>
              {cmd.icon ? <cmd.icon /> : null}
              <span className="truncate">{cmd.label}</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        {(customCommands.length > 0 || appCommands.length > 0) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Commands">
              {[...appCommands, ...customCommands].map((cmd) => (
                <CommandItem key={cmd.id} onSelect={cmd.run}>
                  {cmd.icon ? <cmd.icon /> : null}
                  <span className="truncate">{cmd.label}</span>
                  {cmd.shortcut ? <CommandShortcut>{cmd.shortcut}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}


