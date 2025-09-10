"use client";
import { useApp } from "@/apps/core/context/AppProvider";

export function useAppInstances() {
  const ctx = useApp();
  const {
    instances,
    activeInstanceId,
    createInstance,
    closeInstance,
    renameInstance,
    setActiveInstance,
  } = ctx;

  return {
    instances,
    activeInstanceId,
    createInstance,
    closeInstance,
    renameInstance,
    setActiveInstance,
  };
}
