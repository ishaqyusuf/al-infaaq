import { cn } from "@al-infaaq/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        ghost: "hover:bg-stone-100",
        outline: "border border-stone-300 bg-transparent hover:bg-stone-50",
        secondary: "bg-white text-stone-950 hover:bg-stone-100",
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
