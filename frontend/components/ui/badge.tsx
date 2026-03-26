import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary-container/20 bg-primary-container/10 text-primary",
        secondary: "border-white/10 bg-muted/40 text-foreground",
        outline: "border-primary-container/40 text-primary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

/**
 * Badge primitive used across the UI.
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(function Badge(
  { className, variant, ...props },
  ref,
) {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
});

export default Badge;

