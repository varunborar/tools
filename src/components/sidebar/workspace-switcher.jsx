"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function WorkspaceSwitcher({ teams, brand, value, onValueChange }) {
  const { isMobile, state } = useSidebar();
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(0);
  const index = typeof value === "number" ? value : uncontrolledIndex;
  const setIndex = onValueChange ?? setUncontrolledIndex;
  const activeTeam = teams?.[index];

  if (!teams || teams.length === 0 || !activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                state === "collapsed" && "justify-center"
              )}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-transparent group-data-[collapsible=icon]:hidden">
                {brand?.logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logoSrc} alt={brand.name ?? "Logo"} className="h-8 w-8 object-contain" />
                ) : (
                  <activeTeam.logo className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              {state === "collapsed" ? (
                <activeTeam.logo className="size-4" />
              ) : (
                <ChevronsUpDown className="ml-auto" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {teams.map((team, idx) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setIndex(idx)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{idx + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}


