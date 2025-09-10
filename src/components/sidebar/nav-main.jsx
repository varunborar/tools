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
import navConfig from "@/config/navigation.json" assert { type: "json" };
import { useWorkspace } from "@/contexts/workspace";

export function NavMain({ sectionLabel, services }) {
  const { activeIndex } = useWorkspace();
  const basePath = (navConfig.workspaces ?? [])[activeIndex]?.basePath ?? "";
  const withBase = (href) => `${basePath || ""}${href?.startsWith("/") ? href : `/${href}`}`;
  return (
    <SidebarGroup>
      {sectionLabel ? (
        <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
      ) : null}
      <SidebarMenu>
        {services.map((service) => {
          const hasFeatures = Array.isArray(service.features) && service.features.length > 0;
          if (!hasFeatures) {
            return (
              <SidebarMenuItem key={service.title}>
                <SidebarMenuButton asChild tooltip={service.title}>
                  <Link href={withBase(service.href || "#") }>
                    {service.icon && <service.icon />}
                    <span>{service.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
          return (
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
                          <Link href={withBase(feature.href)}>
                            <span>{feature.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}


