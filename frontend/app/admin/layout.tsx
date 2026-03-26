import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopBar from "@/components/admin/AdminTopBar"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "sonner"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/sign-in")

  const role = (session.user as { role?: string })?.role
  if (role !== "admin") redirect("/")

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminTopBar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
        </div>
      </div>
    </ThemeProvider>
  )
}
