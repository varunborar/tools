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
import { Trash2 } from "lucide-react";

function fieldId() { return Math.random().toString(36).slice(2, 10); }

const TodoEditor = React.forwardRef(function TodoEditor({ instanceId }, ref) {
  const { data, setData } = useInstanceData({ settings: { statuses: [], customFields: [] }, todos: [] }, instanceId);
  const settings = data.settings || { statuses: [], customFields: [] };
  const todos = data.todos || [];

  const [draft, setDraft] = React.useState({ title: "", description: "", tags: "", links: "", status: settings.statuses?.[0]?.id || "open" });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [manageFieldsOpen, setManageFieldsOpen] = React.useState(false);
  const [optionsDraft, setOptionsDraft] = React.useState({});
  const [manageStatusesOpen, setManageStatusesOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const saveTodo = () => {
    const now = new Date().toISOString();
    if (editingId) {
      setData((prev) => ({
        ...prev,
        todos: (prev.todos || []).map((t) => t.id === editingId ? {
          ...t,
          title: draft.title.trim(),
          description: draft.description?.trim() || "",
          tags: draft.tags ? draft.tags.split(",").map((x) => x.trim()).filter(Boolean) : [],
          links: draft.links ? draft.links.split(",").map((x) => x.trim()).filter(Boolean) : [],
          status: draft.status || t.status,
          extras: { ...(t.extras || {}), ...(draft.extras || {}) },
          date_updated: now,
        } : t)
      }));
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
        extras: settings.customFields?.reduce((acc, f) => { acc[f.key] = draft.extras?.[f.key] ?? f.defaultValue ?? ""; return acc; }, {}),
      };
      setData((prev) => ({ ...prev, todos: [ ...(prev.todos || []), todo ] }));
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

  const addCustomField = (field) => {
    setData({ ...data, settings: { ...settings, customFields: [...(settings.customFields || []), field] } });
  };
  const updateCustomField = (key, next) => {
    setData({ ...data, settings: { ...settings, customFields: (settings.customFields || []).map((f) => f.key === key ? next : f) } });
  };
  const deleteCustomField = (key) => {
    setData({ ...data, settings: { ...settings, customFields: (settings.customFields || []).filter((f) => f.key !== key) } });
  };

  // Initialize draft strings for options when opening Manage Fields
  React.useEffect(() => {
    if (!manageFieldsOpen) return;
    const draft = {};
    for (const f of (settings.customFields || [])) {
      draft[f.key] = (f.options || []).join(", ");
    }
    setOptionsDraft(draft);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageFieldsOpen]);

  React.useImperativeHandle(ref, () => ({
    openAddTodo: () => {
      const defaults = (settings.customFields || []).reduce((acc, f) => { acc[f.key] = f.defaultValue ?? ""; return acc; }, {});
      setEditingId(null);
      setDraft({ title: "", description: "", tags: "", links: "", status: settings.statuses?.[0]?.id || "open", extras: defaults });
      setDialogOpen(true);
    },
    addStatus,
    addCustomField,
    openManageCustomFields: () => setManageFieldsOpen(true),
    openManageStatuses: () => setManageStatusesOpen(true),
  }), [addStatus]);

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
    <ScrollArea className="flex-1 min-h-0">
      <div className="flex flex-1 min-h-0 flex-col gap-4 p-1">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <Button
                variant="destructive"
                onClick={() => {
                  setData((prev) => ({ ...prev, todos: (prev.todos || []).filter((t) => t.id !== editingId) }));
                  setDialogOpen(false);
                  setEditingId(null);
                }}
              >
                Delete
              </Button>
            ) : <span />}
            <Button onClick={saveTodo} disabled={!draft.title.trim()}>{editingId ? "Save" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Custom Fields Dialog */}
      <Dialog open={manageFieldsOpen} onOpenChange={setManageFieldsOpen}>
        <DialogContent className="w-[min(720px,100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Manage Custom Fields</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(settings.customFields || []).map((f) => (
              <div key={f.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                <div className="sm:col-span-2">
                  <label className="text-sm">Key</label>
                  <Input value={f.key} onChange={(e) => updateCustomField(f.key, { ...f, key: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm">Label</label>
                  <Input value={f.label || ""} onChange={(e) => updateCustomField(f.key, { ...f, label: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm">Type</label>
                  <select className="border rounded-md px-2 py-2 bg-transparent w-full" value={f.type || "text"} onChange={(e) => updateCustomField(f.key, { ...f, type: e.target.value })}>
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
                      onBlur={(e) => updateCustomField(f.key, { ...f, options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                    />
                  </div>
                ) : null}
                <div className="sm:col-span-5 flex justify-end">
                  <Button variant="ghost" size="icon" aria-label="Delete field" onClick={() => deleteCustomField(f.key)}>
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
                  addCustomField({ key, label, type, options: type === "select" ? options : undefined });
                  document.getElementById("new-key").value = "";
                  document.getElementById("new-label").value = "";
                  document.getElementById("new-options").value = "";
                }}>Add Field</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Statuses Dialog */}
      <Dialog open={manageStatusesOpen} onOpenChange={setManageStatusesOpen}>
        <DialogContent className="w-[min(560px,100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Manage Statuses</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(settings.statuses || []).map((s) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                <div className="sm:col-span-2">
                  <label className="text-sm">ID</label>
                  <Input value={s.id} onChange={(e) => setData({ ...data, settings: { ...settings, statuses: (settings.statuses || []).map((x) => x.id === s.id ? { ...s, id: e.target.value } : x) } })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm">Label</label>
                  <Input value={s.label} onChange={(e) => setData({ ...data, settings: { ...settings, statuses: (settings.statuses || []).map((x) => x.id === s.id ? { ...s, label: e.target.value } : x) } })} />
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" aria-label="Delete status" onClick={() => setData({ ...data, settings: { ...settings, statuses: (settings.statuses || []).filter((x) => x.id !== s.id) } })}>
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
                  setData({ ...data, settings: { ...settings, statuses: [ ...(settings.statuses || []), { id, label } ] } });
                  document.getElementById("new-status-id").value = "";
                  document.getElementById("new-status-label").value = "";
                }}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full overflow-x-auto pb-1 flex-1 min-h-0">
        <div className="flex flex-nowrap gap-4 min-w-full">
        {(settings.statuses?.length ? settings.statuses : [
          { id: "open", label: "Open" },
          { id: "in-progress", label: "In Progress" },
          { id: "done", label: "Done" },
        ]).map((status) => (
          <Card key={status.id} className="h-full flex flex-col flex-1 shrink-0 basis-[240px] min-w-[240px]">
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
                          extras: { ...(t.extras || {}) },
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
      </div>
    </ScrollArea>
  );
});

export default TodoEditor;
