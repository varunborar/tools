"use client";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function AppTabs({ instances, activeId, onCreate, onClose, onActivate, renderContent }) {
  const value = activeId || instances[0]?.id || "";

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2">
      <div className="flex-1 min-h-0">
        <Tabs value={value} onValueChange={onActivate} className="h-full w-full">
          <TabsList>
            {instances.map((inst) => (
              <div key={inst.id} className="flex items-center">
                <TabsTrigger value={inst.id}>{inst.name || "Untitled"}</TabsTrigger>
                <Button aria-label="Close tab" variant="ghost" size="icon" onClick={() => onClose(inst.id)}>
                  <X />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={onCreate} className="ml-2">New</Button>
          </TabsList>
          <div className="flex-1 min-h-0">
            {instances.map((inst) => (
              <TabsContent key={inst.id} value={inst.id} className="h-full w-full pt-2">
                {renderContent(inst)}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
