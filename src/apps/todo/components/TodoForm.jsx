"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TodoForm({
  open,
  onOpenChange,
  editingId,
  draft,
  setDraft,
  settings,
  onSave,
  onDelete,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(720px,100%-2rem)] h-[calc(100vh-2rem)] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Todo" : "Add Todo"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-3">
          <div className="grid gap-2">
            <label className="text-sm">Title</label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Task title" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Description</label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional details" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Tags</label>
            <Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="work, personal" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Links</label>
            <Input value={draft.links} onChange={(e) => setDraft({ ...draft, links: e.target.value })} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Status</label>
            <select className="border rounded-md px-2 py-2 bg-transparent" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {(settings.statuses?.length ? settings.statuses : [
                { id: "open", label: "Open" },
                { id: "in-progress", label: "In Progress" },
                { id: "done", label: "Done" },
              ]).map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          {(settings.customFields || []).map((f) => (
            <div key={f.key} className="grid gap-2">
              <label className="text-sm">{f.label || f.key}</label>
              {f.type === "number" ? (
                <Input type="number" value={draft.extras?.[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, extras: { ...(draft.extras || {}), [f.key]: e.target.value === "" ? "" : Number(e.target.value) } })} />
              ) : f.type === "select" ? (
                <select className="border rounded-md px-2 py-2 bg-transparent" value={draft.extras?.[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, extras: { ...(draft.extras || {}), [f.key]: e.target.value } })}>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <Input value={draft.extras?.[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, extras: { ...(draft.extras || {}), [f.key]: e.target.value } })} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-3">
          {editingId ? (
            <Button variant="destructive" onClick={onDelete}>Delete</Button>
          ) : <span />}
          <Button onClick={onSave} disabled={!draft.title?.trim?.()}> {editingId ? "Save" : "Add"} </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
