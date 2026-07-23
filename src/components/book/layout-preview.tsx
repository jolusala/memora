import { cn } from "@/lib/utils";
import { PAGE_LAYOUTS, type LayoutId } from "@/lib/layouts";

export function LayoutPreview({
  layout,
  className,
}: {
  layout: LayoutId;
  className?: string;
}) {
  const spec = PAGE_LAYOUTS[layout];
  return (
    <div
      className={cn(
        "grid aspect-[4/3] w-full gap-1 rounded-md bg-muted p-1.5",
        spec.gridClassName,
        className
      )}
      aria-hidden="true"
    >
      {spec.slotSpecs.map((slot, i) => (
        <div
          key={i}
          className={cn("rounded-sm bg-muted-foreground/30", slot.className)}
        />
      ))}
    </div>
  );
}
