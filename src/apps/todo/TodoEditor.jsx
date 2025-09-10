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
import TodoForm from "@/apps/todo/components/TodoForm";
import ManageCustomFieldsDialog from "@/apps/todo/dialogs/ManageCustomFieldsDialog";
import ManageStatusesDialog from "@/apps/todo/dialogs/ManageStatusesDialog";
import { useCustomFields } from "@/apps/todo/hooks/useCustomFields";
import { useStatuses } from "@/apps/todo/hooks/useStatuses";

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

  const { fields, addField, updateField, deleteField, buildDefaultExtras } = useCustomFields(data, setData);
  const { statuses, addStatus, updateStatus: updateStatusMeta, deleteStatus } = useStatuses(data, setData);

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
      const defaults = buildDefaultExtras();
      setEditingId(null);
      setDraft({ title: "", description: "", tags: "", links: "", status: settings.statuses?.[0]?.id || "open", extras: defaults });
      setDialogOpen(true);
    },
    addStatus,
    addCustomField: addField,
    openManageCustomFields: () => setManageFieldsOpen(true),
    openManageStatuses: () => setManageStatusesOpen(true),
  }), [addStatus, buildDefaultExtras, addField]);

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
      <TodoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        draft={draft}
        setDraft={setDraft}
        settings={settings}
        onSave={saveTodo}
        onDelete={() => {
          setData((prev) => ({ ...prev, todos: (prev.todos || []).filter((t) => t.id !== editingId) }));
          setDialogOpen(false);
          setEditingId(null);
        }}
      />

      {/* Manage Custom Fields Dialog */}
      <ManageCustomFieldsDialog
        open={manageFieldsOpen}
        onOpenChange={setManageFieldsOpen}
        fields={fields}
        onUpdate={updateField}
        onDelete={deleteField}
        onAdd={(f) => addField(f)}
      />

      {/* Manage Statuses Dialog */}
      <ManageStatusesDialog
        open={manageStatusesOpen}
        onOpenChange={setManageStatusesOpen}
        statuses={statuses}
        onUpdate={(id, next) => updateStatusMeta(id, next)}
        onDelete={(id) => deleteStatus(id)}
        onAdd={({ id, label }) => addStatus({ id, label })}
      />

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
