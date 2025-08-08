"use client"

import { AdminLayout } from "@/components/layout/ClientLayout"
import { AuthGuard } from "@/presentation/auth/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard fallbackUrl="/auth/login">
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
