import { authMiddleware } from "@clerk/nextjs";

/**
 * Clerk v4 authMiddleware — Edge Runtime compatible.
 * All routes are protected by default; publicRoutes are accessible without auth.
 * Admin role check is enforced in app/admin/layout.tsx (server component).
 */
export default authMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
