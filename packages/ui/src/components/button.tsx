import { cn } from "@al-infaaq/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-emerald-650 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-red-700/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4",
        icon: "size-10",
        sm: "h-9 px-3 text-xs",
      },
      variant: {
        default:
          "bg-stone-950 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-250 shadow-sm",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 dark:bg-red-650 dark:hover:bg-red-750",
        ghost:
          "hover:bg-stone-100/80 dark:hover:bg-stone-900/60 text-stone-700 dark:text-stone-300",
        outline:
          "border border-stone-200 bg-transparent hover:bg-stone-50/80 text-stone-900 dark:border-stone-800 dark:text-stone-100 dark:hover:bg-stone-900/50",
        secondary:
          "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-650",
      },
    },
  },
);

function Button({
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
