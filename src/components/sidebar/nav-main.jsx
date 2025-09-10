"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({ sectionLabel, services }) {
  return (
    <SidebarGroup>
      {sectionLabel ? (
        <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
      ) : null}
      <SidebarMenu>
        {services.map((service) => (
          <Collapsible
            key={service.title}
            asChild
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={service.title}>
                  {service.icon && <service.icon />}
                  <span>{service.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {service.features?.map((feature) => (
                    <SidebarMenuSubItem key={feature.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={feature.href}>
                          <span>{feature.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}


