import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip provider wrapper.
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip root.
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Tooltip trigger.
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Tooltip content.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent(props, ref) {
  const { className, sideOffset = 6, ...rest } = props;
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...rest}
    />
  );
});

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };

