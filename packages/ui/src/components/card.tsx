import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 bg-white shadow-sm",
        className,
      )}
      data-slot="card"
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("p-5", className)} data-slot="card-header" {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("p-5 pt-0", className)}
      data-slot="card-content"
      {...props}
    />
  );
}
