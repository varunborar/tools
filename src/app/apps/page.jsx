import navigation from "@/config/navigation.json";
import updates from "@/config/updates.json";
import ServicesSection from "@/components/sections/services-section.jsx";
import UpdatesSection from "@/components/sections/updates-section.jsx";

export default function Apps() {
  const appsWorkspace = navigation.workspaces?.find((w) => w.basePath === "/apps") || navigation.workspaces?.[0];
  return (
    <div className="mx-auto w-full max-w-6xl p-4 space-y-8">
      <ServicesSection
        workspace={appsWorkspace}
        title="Applications"
        subtitle="Browser-first apps by The Big Studio"
      />
      <UpdatesSection updatesData={updates} />
    </div>
  );
}
