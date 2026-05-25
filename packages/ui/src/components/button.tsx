import { cn } from "@al-infaaq/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:border-emerald-700 focus-visible:ring-[3px] focus-visible:ring-emerald-700/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:ring-red-700/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        default: "bg-stone-950 text-white hover:bg-stone-800",
        destructive: "bg-red-700 text-white hover:bg-red-800",
        ghost: "hover:bg-stone-100",
        outline: "border border-stone-300 bg-transparent hover:bg-stone-50",
        secondary: "bg-stone-100 text-stone-950 hover:bg-stone-200",
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
