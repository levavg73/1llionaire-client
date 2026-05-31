"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminNav } from "@/components/layout/SideNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <aside className="shrink-0 border-b bg-muted/30 px-4 py-4 lg:w-56 lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
          <p className="px-3 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">관리자</p>
          <AdminNav />
        </aside>
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
