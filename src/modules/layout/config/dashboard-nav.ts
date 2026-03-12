import {
  Building2,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import type { DashboardNavItem } from "@/modules/layout/components/DashboardSidebar";
import type { User } from "@/types/user.types";

type Role = User["role"];

const superAdminItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tenants", label: "Tenants", icon: Building2 },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const tenantAdminItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: BriefcaseBusiness },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const allowedPathsByRole: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "/dashboard",
    "/dashboard/tenants",
    "/dashboard/users",
    "/dashboard/audit-logs",
    "/dashboard/settings",
  ],
  TENANT_ADMIN: [
    "/dashboard",
    "/dashboard/services",
    "/dashboard/employees",
    "/dashboard/audit-logs",
    "/dashboard/settings",
  ],
};

export function getDashboardNavItems(role: Role): DashboardNavItem[] {
  return role === "SUPER_ADMIN" ? superAdminItems : tenantAdminItems;
}

export function isRoleAllowedPath(role: Role, pathname: string): boolean {
  const allowedPaths = allowedPathsByRole[role];
  return allowedPaths.some(
    (allowedPath) =>
      pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
  );
}
