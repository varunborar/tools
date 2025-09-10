import Link from "next/link";
import navigation from "@/config/navigation.json";
import updates from "@/config/updates.json";
import { Card, CardContent } from "@/components/ui/card";
import { getLucideIconByName } from "@/lib/icon-map";

function ServicesSection() {
  const services = [];
  for (const ws of navigation.workspaces ?? []) {
    for (const section of ws.sections ?? []) {
      for (const service of section.services ?? []) {
        services.push(service);
      }
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Services</h2>
        <p className="text-sm text-muted-foreground">Explore available tools</p>
      </div>
      {services.length === 0 ? (
        <div className="text-sm opacity-70">No services available.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const Icon = svc.icon ? getLucideIconByName(svc.icon) : null;
            return (
              <Link key={svc.href} href={svc.href} className="group block h-full">
                <Card className="group h-full hover:bg-accent/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {Icon ? <Icon /> : null}
                        <div className="font-medium">{svc.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{svc.features?.length ?? 0} features</div>
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

function UpdatesSection() {
  const items = updates.updates ?? [];
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Updates</h2>
        <p className="text-sm text-muted-foreground">Latest changes</p>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-70">No updates yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {items.map((u, idx) => (
            <Link key={`${u.title}-${idx}`} href={u.link} target={u.link?.startsWith("http") ? "_blank" : undefined} className="group">
              <div className="border rounded-lg px-4 py-3 hover:bg-accent/40 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{u.title}</div>
                    <div className="text-sm text-muted-foreground">{u.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">{u.date}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 space-y-8">
      <ServicesSection />
      <UpdatesSection />
    </div>
  );
}
