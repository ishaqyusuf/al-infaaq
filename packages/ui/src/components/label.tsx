import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: shared label primitive composes with nested controls or htmlFor at call sites.
    <label
      className={cn(
        "grid gap-2 text-sm font-medium text-stone-800 dark:text-stone-100",
        className,
      )}
      data-slot="label"
      {...props}
    />
  );
}
