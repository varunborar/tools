"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import navConfig from "@/config/navigation.json" assert { type: "json" };
import { usePathname } from "next/navigation";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { useWorkspace } from "@/contexts/workspace";
import { useActions } from "@/contexts/actions";
import { ActionBar } from "@/components/ui/action-bar";
import * as React from "react";

export function AppHeader() {
  const pathname = usePathname();
  const { activeIndex } = useWorkspace();
  const crumbs = buildBreadcrumbs({ pathname, teams: navConfig.workspaces, activeTeamIndex: activeIndex });
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { actions } = useActions();

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex min-w-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-foreground" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex min-w-0 items-center gap-1 overflow-hidden">
              {mounted && crumbs.map((bc, idx) => [
                (
                  <BreadcrumbItem
                    key={`crumb-${idx}`}
                    className={idx === 0 ? "hidden md:block" : undefined}
                  >
                    {idx < crumbs.length - 1 ? (
                      <BreadcrumbLink href={bc.href} className="truncate max-w-[16ch] align-middle">
                        {bc.title}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="truncate max-w-[22ch] align-middle">{bc.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ),
                idx < crumbs.length - 1 ? (
                  <BreadcrumbSeparator
                    key={`sep-${idx}`}
                    className={idx === 0 ? "hidden md:block" : undefined}
                  />
                ) : null,
              ])}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="px-4 pb-2">
        {mounted && actions?.length ? (
          <div className="flex justify-end">
            <ActionBar actions={actions} />
          </div>
        ) : null}
      </div>
    </div>
  );
}


