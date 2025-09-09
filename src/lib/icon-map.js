// Simple lucide-react icon resolver for string names from JSON config
import * as LucideIcons from "lucide-react";

export function getLucideIconByName(name) {
  if (!name || typeof name !== "string") return LucideIcons.Circle;
  return LucideIcons[name] ?? LucideIcons.Circle;
}

export function mapIconOnCollection(collection) {
  return collection.map((item) => ({
    ...item,
    icon: item.icon ? getLucideIconByName(item.icon) : undefined,
  }));
}


