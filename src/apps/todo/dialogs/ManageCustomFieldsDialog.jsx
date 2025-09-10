"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ManageCustomFieldsDialog({
  open,
  onOpenChange,
  fields,
  onUpdate,
  onDelete,
  onAdd,
}) {
  const [optionsDraft, setOptionsDraft] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    const draft = {};
    for (const f of fields || []) draft[f.key] = (f.options || []).join(", ");
    setOptionsDraft(draft);
  }, [open, fields]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(720px,100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(fields || []).map((f) => (
            <div key={f.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
              <div className="sm:col-span-2">
                <label className="text-sm">Key</label>
                <Input value={f.key} onChange={(e) => onUpdate(f.key, { ...f, key: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm">Label</label>
                <Input value={f.label || ""} onChange={(e) => onUpdate(f.key, { ...f, label: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Type</label>
                <select className="border rounded-md px-2 py-2 bg-transparent w-full" value={f.type || "text"} onChange={(e) => onUpdate(f.key, { ...f, type: e.target.value })}>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown</option>
                </select>
              </div>
              { (f.type === "select") ? (
                <div className="sm:col-span-5">
                  <label className="text-sm">Options (comma separated)</label>
                  <Input
                    value={optionsDraft[f.key] ?? (f.options || []).join(", ")}
                    onChange={(e) => setOptionsDraft((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    onBlur={(e) => onUpdate(f.key, { ...f, options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                  />
                </div>
              ) : null}
              <div className="sm:col-span-5 flex justify-end">
                <Button variant="ghost" size="icon" aria-label="Delete field" onClick={() => onDelete(f.key)}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
            <div className="sm:col-span-2">
              <label className="text-sm">Key</label>
              <Input placeholder="priority" id="new-key" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Label</label>
              <Input placeholder="Priority" id="new-label" />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <select className="border rounded-md px-2 py-2 bg-transparent w-full" id="new-type" defaultValue="text">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown</option>
              </select>
            </div>
            <div className="sm:col-span-5">
              <label className="text-sm">Options (comma separated)</label>
              <Input placeholder="High, Medium, Low" id="new-options" />
            </div>
            <div className="sm:col-span-5">
              <Button size="sm" onClick={() => {
                const key = document.getElementById("new-key").value.trim();
                if (!key) return;
                const label = document.getElementById("new-label").value.trim() || key;
                const type = document.getElementById("new-type").value;
                const options = document.getElementById("new-options").value.split(",").map((x) => x.trim()).filter(Boolean);
                onAdd({ key, label, type, options: type === "select" ? options : undefined });
                document.getElementById("new-key").value = "";
                document.getElementById("new-label").value = "";
                document.getElementById("new-options").value = "";
              }}>Add Field</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
