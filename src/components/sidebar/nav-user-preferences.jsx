"use client";

import * as Lucide from "lucide-react";
import { Cog, Coffee, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup } from "@/components/ui/sidebar";
import socials from "@/config/socials.json" assert { type: "json" };
import prefs from "@/config/user-preferences.json" assert { type: "json" };
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export function NavUserPreferences() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Cog />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">User Preferences</span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 rounded-lg">
              <DropdownMenuLabel className="font-medium">Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {prefs.menu.filter((m) => m.group !== "support").map((item, i) => {
                  if (item.type === "link") {
                    return (
                      <DropdownMenuItem key={`pref-${i}`} asChild>
                        <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>
                          {item.icon === "Cog" && <Cog />}
                          {item.icon === "Coffee" && <Coffee />}
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  }
                  if (item.type === "theme") {
                    return (
                      <DropdownMenuItem key={`pref-${i}`} className="justify-between">
                        <div className="inline-flex items-center gap-2">
                          {isDark ? <Moon /> : <Sun />}
                          <span>Dark mode</span>
                        </div>
                        <Switch checked={isDark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
                      </DropdownMenuItem>
                    );
                  }
                  return null;
                })}
              </DropdownMenuGroup>
              {prefs.menu.some((m) => m.group === "support") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-medium">Support</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {prefs.menu.filter((m) => m.group === "support").map((item, i) => (
                      <DropdownMenuItem key={`support-${i}`} asChild>
                        <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>
                          {item.icon === "Coffee" && <Coffee />}
                          {item.icon === "Github" && <Lucide.Github />}
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="border-t mx-2 mt-2" />
        <div className="px-2 pb-2 mt-3 flex items-center justify-center gap-4">
          {socials.links?.map((link, i) => {
            const Icon = Lucide[link.icon] ?? Lucide.Link;
            return (
              <Link key={`social-${i}`} className="inline-flex items-center" href={link.href} target="_blank" rel="noreferrer">
                <Icon className="size-4" />
              </Link>
            );
          })}
        </div>
      </SidebarGroup>
    </>
  );
}


