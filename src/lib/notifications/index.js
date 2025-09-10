// Notification abstraction over sonner
import { toast } from "sonner";

export function notify(message, options = {}) {
  return toast(message, options);
}

export function notifySuccess(message, options = {}) {
  return toast.success(message, options);
}

export function notifyError(message, options = {}) {
  return toast.error(message, options);
}

export function notifyInfo(message, options = {}) {
  return toast.message(message, options);
}

export function notifyPromise(promise, { loading = "Working...", success = "Done", error = "Failed" } = {}) {
  return toast.promise(promise, { loading, success, error });
}


