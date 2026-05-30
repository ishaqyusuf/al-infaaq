import { cn } from "@al-infaaq/utils/cn";
import type * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.015)] dark:border-stone-800 dark:bg-stone-950",
        className,
      )}
      data-slot="card"
      {...props}
    />
  );
}

export function PremiumCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-stone-200/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-stone-800 dark:bg-stone-950",
        className,
      )}
      data-slot="premium-card"
      {...props}
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
      {props.children}
    </div>
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
