"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Abstract Action Bar component
// Props:
// - actions: Array<{ key: string, label: string, onClick: () => void, icon?: ReactNode, variant?: string, disabled?: boolean }>
// - className?: string
// - align?: "start" | "center" | "end" (default: end)
// - children?: ReactNode (optional extra content on the left)
// action types:
// - type: "button" (default): { key, label, onClick, icon?, variant?, disabled? }
// - type: "split-dropdown": { key, label, onClick, icon?, variant?, disabled?, menu: [{ key, label, onClick, disabled? }] }
export function ActionBar({ actions = [], className, align = "end", children, size = "sm", responsive = true, mobileLabel = "Actions" }) {
  const justify = align === "start" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";

  const renderInline = () => (
    <div className={cn("flex items-center gap-2", justify)}>
      {children ? <div className="mr-auto contents">{children}</div> : null}
      {actions.map((action) => {
        const type = action.type || "button";
        if (type === "split-dropdown") {
          return (
            <div key={action.key} className="inline-flex items-stretch">
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
                disabled={Boolean(action.disabled)}
                size={action.size || size}
                className="min-w-20 rounded-r-none border-r-0"
              >
                {action.icon}
                <span>{action.label}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={action.variant || "default"}
                    disabled={Boolean(action.disabled)}
                    size={action.size || size}
                    className="rounded-l-none px-2"
                    aria-label={`${action.label} options`}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {action.menu?.map((item) => (
                    <DropdownMenuItem key={item.key} onClick={item.onClick} disabled={Boolean(item.disabled)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
        return (
          <Button
            key={action.key}
            onClick={action.onClick}
            variant={action.variant || "default"}
            disabled={Boolean(action.disabled)}
            size={action.size || size}
            className="min-w-20"
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );

  const renderMenuItems = () => {
    const items = [];
    actions.forEach((action) => {
      const type = action.type || "button";
      if (type === "split-dropdown") {
        items.push(
          <DropdownMenuSub key={`${action.key}-sub`}>
            <DropdownMenuSubTrigger>{action.label}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={action.onClick} disabled={Boolean(action.disabled)}>
                {action.label} (default)
              </DropdownMenuItem>
              {action.menu?.length ? <DropdownMenuSeparator /> : null}
              {action.menu?.map((item) => (
                <DropdownMenuItem key={item.key} onClick={item.onClick} disabled={Boolean(item.disabled)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      } else {
        items.push(
          <DropdownMenuItem key={action.key} onClick={action.onClick} disabled={Boolean(action.disabled)}>
            {action.label}
          </DropdownMenuItem>
        );
      }
    });
    return items;
  };

  return (
    <div className={cn("w-full", className)}>
      {responsive ? (
        <>
          <div className="hidden sm:flex justify-end w-full">{renderInline()}</div>
          <div className={cn("flex sm:hidden w-full", "justify-end")}> 
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={size} variant="outline" className="min-w-24">
                  <span className="mr-1">{mobileLabel}</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {renderMenuItems()}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        renderInline()
      )}
    </div>
  );
}


