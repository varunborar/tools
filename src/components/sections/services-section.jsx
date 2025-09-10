import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getLucideIconByName } from "@/lib/icon-map";

export default function ServicesSection({ workspace, title = "Services", subtitle = "Explore available tools" }) {
  const services = [];
  for (const section of workspace?.sections ?? []) {
    for (const service of section.services ?? []) {
      services.push(service);
    }
  }

  const basePath = (workspace?.basePath ?? "").trim();
  const isExternal = (href) => /^https?:\/\//i.test(href || "");
  const prefixHref = (href) => {
    if (!href) return "#";
    if (isExternal(href)) return href;
    const base = basePath === "/" ? "" : basePath;
    if (!base) {
      return href.startsWith("/") ? href : `/${href}`;
    }
    if (href === base || href.startsWith(`${base}/`)) return href; // already prefixed
    if (href.startsWith("/")) return `${base}${href}`;
    const a = base.replace(/\/+$/g, "");
    const b = href.replace(/^\/+/, "");
    return `${a}/${b}`;
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {services.length === 0 ? (
        <div className="text-sm opacity-70">No services available.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const Icon = svc.icon ? getLucideIconByName(svc.icon) : null;
            const featureCount = Array.isArray(svc.features) ? svc.features.length : 0;
            const finalHref = prefixHref(svc.href);
            return (
              <Link key={svc.href} href={finalHref} className="group block h-full">
                <Card className="group h-full hover:bg-accent/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {Icon ? <Icon /> : null}
                        <div className="font-medium">{svc.title}</div>
                      </div>
                      {featureCount > 0 ? (
                        <div className="text-xs text-muted-foreground">{featureCount} features</div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
