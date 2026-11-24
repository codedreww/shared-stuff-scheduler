import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Resource } from "@/lib/booking";

type ResourceTabsProps = {
  resources: Resource[];
  resourceId: string;
  onChange: (resourceId: string) => void;
};

/** Switches between the shared resources and describes the selected one. */
export function ResourceTabs({
  resources,
  resourceId,
  onChange,
}: ResourceTabsProps) {
  const selected = resources.find((r) => r.id === resourceId);

  return (
    <div className="space-y-2">
      <Tabs value={resourceId} onValueChange={(value) => onChange(value)}>
        <TabsList className="w-full">
          {resources.map((resource) => (
            <TabsTrigger key={resource.id} value={resource.id}>
              {resource.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {selected && (
        <p className="text-sm text-muted-foreground">{selected.description}</p>
      )}
    </div>
  );
}
