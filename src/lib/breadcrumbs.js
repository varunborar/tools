import { getLucideIconByName } from "@/lib/icon-map";

export function buildBreadcrumbs({ pathname, teams, activeTeamIndex }) {
  const crumbs = [];
  if (!pathname) return crumbs;
  const segments = pathname.split("/").filter(Boolean);

  // Home
  crumbs.push({ title: "Home", href: "/" });

  const team = teams?.[activeTeamIndex];
  if (!team) return crumbs;

  // Workspace base path crumb (e.g., "/apps" -> "Apps")
  const basePath = team.basePath || "";
  const baseSeg = String(basePath).replace(/^\//, "").split("/")[0] || "";
  if (baseSeg) {
    const baseHref = basePath || `/${baseSeg}`;
    crumbs.push({ title: humanize(baseSeg), href: baseHref });
  }

  // Try to match the longest feature/service prefix to label nicely
  let accum = "";
  segments.forEach((seg, idx) => {
    accum += `/${seg}`;
    // Skip adding a duplicate crumb for the workspace base segment
    if (idx === 0 && baseSeg && seg.toLowerCase() === baseSeg.toLowerCase()) {
      return;
    }
    const match = findMatchInTeam(team, accum);
    if (match) {
      const isLast = idx === segments.length - 1;
      crumbs.push({ title: match.title, href: accum, icon: match.icon, isLast });
    } else {
      crumbs.push({ title: humanize(seg), href: accum, isLast: idx === segments.length - 1 });
    }
  });

  return normalizeCrumbs(crumbs);
}

function findMatchInTeam(team, href) {
  for (const section of team.sections ?? []) {
    for (const service of section.services ?? []) {
      if (service.href === href) {
        return { title: service.title, icon: getLucideIconByName(service.icon) };
      }
      for (const feature of service.features ?? []) {
        if (feature.href === href) {
          return { title: feature.title, icon: getLucideIconByName(service.icon) };
        }
      }
    }
  }
  return null;
}

function normalizeCrumbs(crumbs) {
  // Remove duplicates that can appear if Home is repeated
  const seen = new Set();
  return crumbs.filter((c) => {
    const key = `${c.title}|${c.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function humanize(str) {
  return str.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}


