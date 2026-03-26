import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

/**
 * Scroll area primitive wrapper.
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(function ScrollArea(props, ref) {
  const { className, ...rest } = props;
  return <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...rest} />;
});

/**
 * Scroll area viewport.
 */
const ScrollAreaViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
>(function ScrollAreaViewport(props, ref) {
  const { className, ...rest } = props;
  return (
    <ScrollAreaPrimitive.Viewport
      ref={ref}
      className={cn("h-full w-full rounded-[inherit]", className)}
      {...rest}
    />
  );
});

/**
 * Scrollbar component.
 */
const ScrollAreaScrollbar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(function ScrollAreaScrollbar(props, ref) {
  const { className, orientation = "vertical", ...rest } = props;
  return (
    <ScrollAreaPrimitive.Scrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none bg-transparent p-0.5 transition-colors",
        orientation === "vertical" ? "h-full w-2.5 border-l border-white/5" : "h-2.5 flex-col border-t border-white/5",
        className,
      )}
      {...rest}
    />
  );
});

/**
 * Scroll thumb used inside the scrollbar.
 */
const ScrollAreaThumb = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Thumb>
>(function ScrollAreaThumb(props, ref) {
  const { className, ...rest } = props;
  return (
    <ScrollAreaPrimitive.Thumb
      ref={ref}
      className={cn("relative flex-1 rounded-full bg-muted-foreground/30", className)}
      {...rest}
    />
  );
});

export { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb };

