import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700/20",
        className,
      )}
      data-slot="badge"
      {...props}
    />
  );
}
