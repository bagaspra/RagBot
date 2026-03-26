import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopBar from "../../components/admin/AdminTopBar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

/**
 * Server-side layout for the Admin Dashboard.
 * Enforces authentication and admin-role checks.
 *
 * Uses currentUser() instead of sessionClaims to read publicMetadata,
 * because Clerk does not include publicMetadata in the JWT by default.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // If not authenticated, redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch full user to read publicMetadata.role (always up-to-date)
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (role !== "admin") {
    redirect("/");
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Left Sidebar: 240px fixed */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminTopBar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
        </div>
      </div>
    </ThemeProvider>
  );
}
