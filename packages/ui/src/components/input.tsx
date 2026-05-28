import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-base text-stone-950 outline-none transition-all placeholder:text-stone-500/80 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:ring-red-600/20 md:text-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500/20",
        className,
      )}
      data-slot="input"
      {...props}
    />
  );
}

