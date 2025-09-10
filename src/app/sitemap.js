import navigation from "@/config/navigation.json";
import updates from "@/config/updates.json";

export default async function sitemap() {
  const baseUrl = "https://thebigstudio.in";
  const urls = new Set(["/"]);

  for (const ws of navigation.workspaces ?? []) {
    for (const section of ws.sections ?? []) {
      for (const service of section.services ?? []) {
        urls.add(service.href);
        for (const feature of service.features ?? []) {
          urls.add(feature.href);
        }
      }
    }
  }

  for (const u of updates.updates ?? []) {
    if (typeof u.link === "string" && u.link.startsWith("/")) {
      urls.add(u.link);
    }
  }

  const now = new Date().toISOString();

  return Array.from(urls).map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
