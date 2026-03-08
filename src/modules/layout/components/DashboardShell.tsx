"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/modules/layout/components/DashboardNavbar";
import DashboardSidebar, {
  DashboardNavItem,
} from "@/modules/layout/components/DashboardSidebar";

type DashboardShellProps = {
  children: ReactNode;
};

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tenants", label: "Tenants", icon: Building2 },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#d6d6db]">
        <p className="text-sm font-medium text-[#656a76]">Cargando panel...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#d6d6db]">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-full overflow-hidden bg-[#e9e9ed] shadow-[0_18px_45px_rgba(31,35,48,0.18)]">
        <DashboardSidebar
          items={navItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="relative flex min-w-0 flex-1 flex-col p-3">
          <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="mt-3 min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
