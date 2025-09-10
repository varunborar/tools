"use client";
import * as React from "react";
import { useInstanceData } from "@/apps/core/hooks/useInstanceData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function fieldId() { return Math.random().toString(36).slice(2, 10); }

const TodoEditor = React.forwardRef(function TodoEditor({ instanceId }, ref) {
  const { data, setData } = useInstanceData({ settings: { statuses: [], customFields: [] }, todos: [] }, instanceId);
  const settings = data.settings || { statuses: [], customFields: [] };
  const todos = data.todos || [];

  const [draft, setDraft] = React.useState({ title: "", description: "", tags: "", links: "", status: settings.statuses?.[0]?.id || "open" });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const saveTodo = () => {
    const now = new Date().toISOString();
    if (editingId) {
      setData({
        ...data,
        todos: todos.map((t) => t.id === editingId ? {
          ...t,
          title: draft.title.trim(),
          description: draft.description?.trim() || "",
          tags: draft.tags ? draft.tags.split(",").map((x) => x.trim()).filter(Boolean) : [],
          links: draft.links ? draft.links.split(",").map((x) => x.trim()).filter(Boolean) : [],
          status: draft.status || t.status,
          date_updated: now,
        } : t)
      });
    } else {
      const todo = {
        id: fieldId(),
        title: draft.title.trim(),
        description: draft.description?.trim() || "",
        tags: draft.tags ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        links: draft.links ? draft.links.split(",").map((l) => l.trim()).filter(Boolean) : [],
        status: draft.status || settings.statuses?.[0]?.id || "open",
        date_created: now,
        date_updated: now,
        extras: settings.customFields?.reduce((acc, f) => { acc[f.key] = f.defaultValue ?? null; return acc; }, {}),
      };
      setData({ ...data, todos: [...todos, todo] });
    }
    setDialogOpen(false);
    setEditingId(null);
    setDraft({ title: "", description: "", tags: "", links: "", status: draft.status });
  };

  const updateStatus = (id, nextStatus) => {
    const now = new Date().toISOString();
    setData({ ...data, todos: todos.map((t) => t.id === id ? { ...t, status: nextStatus, date_updated: now } : t) });
  };

  // Delete action is removed from UI; keeping function if needed elsewhere
  const removeTodo = (id) => { setData({ ...data, todos: todos.filter((t) => t.id !== id) }); };

  const addStatus = () => {
    const id = fieldId();
    const label = prompt("New status label?") || "Custom";
    const next = { id, label };
    setData({ ...data, settings: { ...settings, statuses: [...(settings.statuses || []), next] } });
  };

  const addCustomField = () => {
    const key = prompt("Custom field key?") || fieldId();
    const label = prompt("Custom field label?") || key;
    setData({ ...data, settings: { ...settings, customFields: [...(settings.customFields || []), { key, label }] } });
  };

  React.useImperativeHandle(ref, () => ({
    openAddTodo: () => { setEditingId(null); setDraft({ title: "", description: "", tags: "", links: "", status: settings.statuses?.[0]?.id || "open" }); setDialogOpen(true); },
    addStatus,
    addCustomField,
  }), [addStatus, addCustomField]);

  // Drag & Drop handlers
  const onDragStart = (e, todoId) => {
    try { e.dataTransfer.setData("text/plain", todoId); } catch {}
  };
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const onDropOnStatus = (e, statusId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const t = todos.find((x) => x.id === id);
    if (!t || t.status === statusId) return;
    updateStatus(id, statusId);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[min(720px,100%-2rem)] h-[calc(100vh-2rem)]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Todo" : "Add Todo"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <label className="text-sm">Title</label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Task title" />
          </div>
          <div className="grid gap-2 mt-2">
            <label className="text-sm">Description</label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional details" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-2">
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
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={saveTodo} disabled={!draft.title.trim()}>{editingId ? "Save" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="flex gap-4 overflow-x-auto pb-1 w-full flex-1 min-h-0 sm:grid sm:overflow-x-visible"
        style={{ gridTemplateColumns: `repeat(${(settings.statuses?.length || 3)}, minmax(0, 1fr))` }}
      >
        {(settings.statuses?.length ? settings.statuses : [
          { id: "open", label: "Open" },
          { id: "in-progress", label: "In Progress" },
          { id: "done", label: "Done" },
        ]).map((status) => (
          <Card key={status.id} className="h-full flex flex-col shrink-0 min-w-[85vw] sm:min-w-0 sm:shrink">
            <CardContent className="flex-1 min-h-0 pt-4 space-y-3" onDragOver={onDragOver} onDrop={(e) => onDropOnStatus(e, status.id)}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{status.label}</div>
                <Badge>{todos.filter((t) => t.status === status.id).length}</Badge>
              </div>
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 pr-2">
                  {todos.filter((t) => t.status === status.id).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-md border p-3 cursor-pointer"
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      onClick={() => {
                        setEditingId(t.id);
                        setDraft({
                          title: t.title || "",
                          description: t.description || "",
                          tags: (t.tags || []).join(", "),
                          links: (t.links || []).join(", "),
                          status: t.status,
                        });
                        setDialogOpen(true);
                      }}>
                      <div className="font-medium">{t.title}</div>
                      {t.description ? <div className="text-sm opacity-80">{t.description}</div> : null}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.tags?.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                      {t.links?.length ? (
                        <div className="flex flex-col text-xs mt-1">
                          {t.links.map((l, idx) => <a key={`${l}-${idx}`} href={l} target="_blank" className="underline text-muted-foreground">{l}</a>)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default TodoEditor;
