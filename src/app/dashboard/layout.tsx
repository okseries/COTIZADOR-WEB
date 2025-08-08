"use client"

import { AdminLayout } from "@/components/layout/ClientLayout"
// ...existing code...

// import { AuthGuard } from "@/components/auth/ui/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  //  <AuthGuard fallbackUrl="/auth/login">
      <AdminLayout>
        {children}
      </AdminLayout>
    // </AuthGuard>
  );
}
