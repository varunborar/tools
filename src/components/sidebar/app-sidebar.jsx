"use client";

import * as React from "react";
import { getLucideIconByName } from "@/lib/icon-map";
import navConfig from "@/config/navigation.json" assert { type: "json" };
import { useWorkspace } from "@/contexts/workspace";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUserPreferences } from "@/components/sidebar/nav-user-preferences";
import { WorkspaceSwitcher } from "@/components/sidebar/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar(props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const teams = (navConfig.workspaces ?? []).map((t) => ({
    ...t,
    logo: getLucideIconByName(t.logo),
    sections: (t.sections ?? []).map((section) => ({
      ...section,
      services: (section.services ?? []).map((svc) => ({
        ...svc,
        icon: getLucideIconByName(svc.icon),
      })),
    })),
  }));
  const { activeIndex, setActiveIndex } = useWorkspace();
  const activeTeam = teams[activeIndex];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher
          brand={navConfig.brand}
          teams={teams}
          value={activeIndex}
          onValueChange={setActiveIndex}
        />
      </SidebarHeader>
      <SidebarContent>
        {mounted && activeTeam?.sections?.map((section) => (
          <NavMain key={section.label} sectionLabel={section.label} services={section.services} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUserPreferences />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


