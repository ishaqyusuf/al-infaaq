import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none transition-colors focus-visible:border-emerald-700 focus-visible:ring-[3px] focus-visible:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-red-700/20 md:text-sm",
        className,
      )}
      data-slot="select"
      {...props}
    />
  );
}
