"use client";
import * as React from "react";

export function useStatuses(data, setData) {
  const statuses = data?.settings?.statuses || [];

  const updateStatus = React.useCallback((id, next) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        statuses: (prev.settings?.statuses || []).map((s) => s.id === id ? next : s),
      },
    }));
  }, [setData]);

  const deleteStatus = React.useCallback((id) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        statuses: (prev.settings?.statuses || []).filter((s) => s.id !== id),
      },
    }));
  }, [setData]);

  const addStatus = React.useCallback((status) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, statuses: [ ...(prev.settings?.statuses || []), status ] },
    }));
  }, [setData]);

  return { statuses, updateStatus, deleteStatus, addStatus };
}
