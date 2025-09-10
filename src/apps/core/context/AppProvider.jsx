"use client";
import * as React from "react";
import { createLocalStorageAdapter } from "@/apps/core/storage";

const AppContext = React.createContext(null);

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function generateId() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}`;
}

export function AppProvider({ appId, schemaVersion = "1", defaults = {}, storageAdapter, children }) {
  const storage = React.useMemo(() => storageAdapter || createLocalStorageAdapter("apps"), [storageAdapter]);

  const INSTANCES_KEY = `instances:${appId}`;
  const ACTIVE_KEY = `active:${appId}`;

  const [instances, setInstances] = React.useState(() => storage.get(INSTANCES_KEY, []));
  const [activeInstanceId, setActiveInstanceId] = React.useState(() => storage.get(ACTIVE_KEY, null));

  React.useEffect(() => { storage.set(INSTANCES_KEY, instances); }, [instances]);
  React.useEffect(() => { storage.set(ACTIVE_KEY, activeInstanceId); }, [activeInstanceId]);

  React.useEffect(() => {
    if (instances.length === 0) {
      const id = generateId();
      const now = new Date().toISOString();
      setInstances([{ id, name: "Untitled", createdAt: now, updatedAt: now }]);
      setActiveInstanceId(id);
    } else if (!activeInstanceId) {
      setActiveInstanceId(instances[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createInstance(initialData) {
    const id = generateId();
    const now = new Date().toISOString();
    setInstances((prev) => [...prev, { id, name: "Untitled", createdAt: now, updatedAt: now }]);
    setActiveInstanceId(id);
    if (initialData) setInstanceData(id, initialData);
    return id;
  }

  function closeInstance(id) {
    setInstances((prev) => prev.filter((i) => i.id !== id));
    if (activeInstanceId === id) {
      const next = instances.find((i) => i.id !== id)?.id || null;
      setActiveInstanceId(next);
    }
    storage.remove(`instance:${appId}:${id}`);
  }

  function renameInstance(id, name) {
    setInstances((prev) => prev.map((i) => i.id === id ? { ...i, name, updatedAt: new Date().toISOString() } : i));
  }

  function setActiveInstance(id) {
    setActiveInstanceId(id);
  }

  function getInstanceData(id) {
    return storage.get(`instance:${appId}:${id}`, { appId, schemaVersion, data: defaults });
  }

  const saveQueue = React.useRef({});
  function setInstanceData(id, data) {
    const key = `instance:${appId}:${id}`;
    const payload = { appId, schemaVersion, data, savedAt: new Date().toISOString() };
    storage.set(key, payload);
  }

  function exportInstance(id) {
    const inst = instances.find((i) => i.id === id);
    if (!inst) return null;
    const body = getInstanceData(id);
    return {
      appId,
      schemaVersion,
      instance: { id, name: inst.name, data: body?.data ?? {} },
      exportedAt: new Date().toISOString(),
    };
  }

  function importIntoInstance(targetId, json) {
    try {
      const payload = typeof json === "string" ? JSON.parse(json) : json;
      if (!payload || payload.appId !== appId) return { ok: false, error: "Invalid appId" };
      const id = targetId || generateId();
      const now = new Date().toISOString();
      if (!targetId) {
        setInstances((prev) => [...prev, { id, name: payload.instance?.name || "Imported", createdAt: now, updatedAt: now }]);
      } else {
        // update timestamp
        setInstances((prev) => prev.map((i) => i.id === id ? { ...i, updatedAt: now } : i));
      }
      setInstanceData(id, payload.instance?.data ?? {});
      setActiveInstanceId(id);
      return { ok: true, id };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  const value = React.useMemo(() => ({
    appId,
    schemaVersion,
    instances,
    activeInstanceId,
    createInstance,
    closeInstance,
    renameInstance,
    setActiveInstance,
    getInstanceData,
    setInstanceData,
    exportInstance,
    importIntoInstance,
  }), [appId, schemaVersion, instances, activeInstanceId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
