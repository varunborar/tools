"use client";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function AppTabs({ instances, activeId, onCreate, onClose, onActivate, onRename, renderContent }) {
  const value = activeId || instances[0]?.id || "";
  const [editingId, setEditingId] = React.useState(null);
  const [editingValue, setEditingValue] = React.useState("");
  const inputRef = React.useRef(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  function startEditing(inst) {
    setEditingId(inst.id);
    setEditingValue(inst.name || "Untitled");
  }

  function commitEditing(inst) {
    const next = (editingValue || "").trim();
    if (next && next !== (inst.name || "Untitled")) onRename?.(inst.id, next);
    setEditingId(null);
    setEditingValue("");
  }

  return (
    <div className="flex flex-1 min-h-0 min-w-0 flex-col gap-2">
      <div className="flex-1 min-h-0 min-w-0">
        <Tabs value={mounted ? value : undefined} onValueChange={onActivate} className="h-full w-full">
          <div className="w-full overflow-x-auto min-w-0">
            <TabsList className="flex w-max whitespace-nowrap justify-start gap-1">
              {mounted ? instances.map((inst) => (
                <div key={inst.id} className="flex items-center">
                  <TabsTrigger value={inst.id} className="flex-none px-2" onDoubleClick={() => startEditing(inst)}>
                    {editingId === inst.id ? (
                      <input
                        ref={inputRef}
                        className="bg-transparent outline-none border border-input rounded px-1 py-0.5 text-sm w-[10ch] max-w-[20ch]"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEditing(inst);
                          if (e.key === "Escape") { setEditingId(null); setEditingValue(""); }
                        }}
                        onBlur={() => commitEditing(inst)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      inst.name || "Untitled"
                    )}
                  </TabsTrigger>
                  <Button aria-label="Close tab" variant="ghost" size="icon" className="flex-none" onClick={() => onClose(inst.id)}>
                    <X />
                  </Button>
                </div>
              )) : null}
              {mounted ? (
                <Button variant="outline" size="sm" onClick={onCreate} className="ml-2 flex-none">New</Button>
              ) : null}
            </TabsList>
          </div>
          <div className="flex-1 min-h-0">
            {mounted ? instances.map((inst) => (
              <TabsContent key={inst.id} value={inst.id} className="h-full w-full pt-2">
                {renderContent(inst)}
              </TabsContent>
            )) : null}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
