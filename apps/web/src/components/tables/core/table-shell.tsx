import { cn } from "@al-infaaq/utils/cn";
import type { ReactNode } from "react";

export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-[860px] text-sm", className)}>
      {children}
    </div>
  );
}
