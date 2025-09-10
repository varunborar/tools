"use client";
import * as React from "react";
import { useApp } from "@/apps/core/context/AppProvider";

export function useInstanceData(initialData = {}, instanceIdOverride) {
  const { activeInstanceId, getInstanceData, setInstanceData } = useApp();
  const instanceId = instanceIdOverride || activeInstanceId;

  const [data, setData] = React.useState(() => {
    const payload = instanceId ? getInstanceData(instanceId) : { data: initialData };
    return payload?.data ?? initialData;
  });

  React.useEffect(() => {
    const payload = instanceId ? getInstanceData(instanceId) : { data: initialData };
    setData(payload?.data ?? initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  React.useEffect(() => {
    if (!instanceId) return;
    setInstanceData(instanceId, data);
  }, [instanceId, data, setInstanceData]);

  return { data, setData };
}
