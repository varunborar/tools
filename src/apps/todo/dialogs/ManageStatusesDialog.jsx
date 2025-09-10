"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ManageStatusesDialog({ open, onOpenChange, statuses, onUpdate, onDelete, onAdd }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(560px,100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Manage Statuses</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(statuses || []).map((s) => (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
              <div className="sm:col-span-2">
                <label className="text-sm">ID</label>
                <Input value={s.id} onChange={(e) => onUpdate(s.id, { ...s, id: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm">Label</label>
                <Input value={s.label} onChange={(e) => onUpdate(s.id, { ...s, label: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" aria-label="Delete status" onClick={() => onDelete(s.id)}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
            <div className="sm:col-span-2">
              <label className="text-sm">ID</label>
              <Input id="new-status-id" placeholder="blocked" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Label</label>
              <Input id="new-status-label" placeholder="Blocked" />
            </div>
            <div>
              <Button size="sm" onClick={() => {
                const id = document.getElementById("new-status-id").value.trim();
                if (!id) return;
                const label = document.getElementById("new-status-label").value.trim() || id;
                onAdd({ id, label });
                document.getElementById("new-status-id").value = "";
                document.getElementById("new-status-label").value = "";
              }}>Add</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
