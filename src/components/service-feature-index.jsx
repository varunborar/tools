import * as React from "react"
import Link from "next/link"
import navigation from "@/config/navigation.json"
import { Card, CardContent } from "@/components/ui/card"
import { getLucideIconByName } from "@/lib/icon-map"
import { ArrowRight } from "lucide-react"

function findServiceByHref(serviceHref) {
  const workspaces = navigation?.workspaces ?? []
  for (const ws of workspaces) {
    for (const section of ws.sections ?? []) {
      for (const service of section.services ?? []) {
        if (service.href === serviceHref) return service
      }
    }
  }
  return null
}

export default function ServiceFeatureIndex({ serviceHref }) {
  const service = findServiceByHref(serviceHref)
  const ServiceIcon = service?.icon ? getLucideIconByName(service.icon) : null
  const features = service?.features ?? []

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ServiceIcon ? <ServiceIcon /> : null}
          <h2 className="text-lg font-semibold">{service?.title ?? "Features"}</h2>
        </div>
        <p className="text-sm text-muted-foreground">Select a feature to continue.</p>
      </div>

      {features.length === 0 ? (
        <div className="mt-6 text-sm opacity-70">No features available.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group block h-full">
              <Card className="group h-full hover:bg-accent/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{feature.title}</div>
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
