"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { FreelancerNav } from "@/components/layout/SideNav";

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["freelancer"]} renderWhileLoading>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="lg:w-52 lg:shrink-0">
            <FreelancerNav />
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
