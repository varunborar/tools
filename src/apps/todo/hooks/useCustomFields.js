"use client";
import * as React from "react";

export function useCustomFields(data, setData) {
  const fields = data?.settings?.customFields || [];

  const addField = React.useCallback((field) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, customFields: [ ...(prev.settings?.customFields || []), field ] },
    }));
  }, [setData]);

  const updateField = React.useCallback((key, next) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customFields: (prev.settings?.customFields || []).map((f) => f.key === key ? next : f),
      },
    }));
  }, [setData]);

  const deleteField = React.useCallback((key) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customFields: (prev.settings?.customFields || []).filter((f) => f.key !== key),
      },
    }));
  }, [setData]);

  const buildDefaultExtras = React.useCallback(() => {
    const defaults = {};
    for (const f of fields) defaults[f.key] = f.defaultValue ?? "";
    return defaults;
  }, [fields]);

  return { fields, addField, updateField, deleteField, buildDefaultExtras };
}
