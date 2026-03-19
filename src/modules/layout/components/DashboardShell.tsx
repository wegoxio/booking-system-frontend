"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/modules/layout/components/DashboardNavbar";
import DashboardSidebar, {
} from "@/modules/layout/components/DashboardSidebar";
import TenantAdminDashboardTourController from "@/modules/tour/components/TenantAdminDashboardTourController";
import {
  getDashboardNavItems,
  isRoleAllowedPath,
} from "@/modules/layout/config/dashboard-nav";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourRunNonce, setTourRunNonce] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && user && !isRoleAllowedPath(user.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <p className="text-sm font-medium text-muted">Cargando panel...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (!user) return null;
  if (!isRoleAllowedPath(user.role, pathname)) return null;

  const navItems = getDashboardNavItems(user.role);
  const isTenantAdminDashboard = user.role === "TENANT_ADMIN" && pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex h-screen max-w-full overflow-hidden bg-shell shadow-theme-shell">
        <DashboardSidebar
          items={navItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="relative flex min-w-0 flex-1 flex-col p-3">
          <DashboardNavbar
            onMenuClick={() => setSidebarOpen(true)}
            isTourAvailable={isTenantAdminDashboard}
            onTourClick={
              isTenantAdminDashboard
                ? () => setTourRunNonce((current) => current + 1)
                : undefined
            }
          />
          <main className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">{children}</main>
        </div>
      </div>
      <TenantAdminDashboardTourController
        isEnabled={isTenantAdminDashboard}
        userId={user.id}
        runNonce={tourRunNonce}
      />
    </div>
  );
}
