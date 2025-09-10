"use client";
import * as React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function AppMenubar({ menus = [], onAction }) {
  const handle = (id) => {
    if (typeof onAction === "function") onAction(id);
  };

  return (
    <Menubar>
      {menus.map((menu, idx) => (
        <MenubarMenu key={`${menu.label}-${idx}`}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items?.map((it, jdx) => {
              if (it.separator) return <MenubarSeparator key={`sep-${jdx}`} />;
              if (it.items) {
                return (
                  <MenubarSub key={`${it.label}-${jdx}`}>
                    <MenubarSubTrigger>{it.label}</MenubarSubTrigger>
                    <MenubarSubContent>
                      {it.items.map((sub, kdx) => (
                        sub.separator ? (
                          <MenubarSeparator key={`sub-sep-${kdx}`} />
                        ) : (
                          <MenubarItem key={`${sub.id}-${kdx}`} disabled={sub.disabled} onClick={() => handle(sub.id)}>
                            {sub.label}
                          </MenubarItem>
                        )
                      ))}
                    </MenubarSubContent>
                  </MenubarSub>
                );
              }
              return (
                <MenubarItem key={`${it.id}-${jdx}`} disabled={it.disabled} onClick={() => handle(it.id)}>
                  {it.label}
                </MenubarItem>
              );
            })}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
