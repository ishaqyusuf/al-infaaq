import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("rounded-md px-3 py-2 text-sm font-medium", className)}
      data-slot="badge"
      {...props}
    />
  );
}
