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
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/users", label: "Tenant Admins", icon: Users },
  { href: "/audit-logs", label: "Audit Logs", icon: ReceiptText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const tenantAdminItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: BriefcaseBusiness },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/audit-logs", label: "Audit Logs", icon: ReceiptText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const allowedPathsByRole: Record<Role, string[]> = {
  SUPER_ADMIN: [
    "/dashboard",
    "/tenants",
    "/users",
    "/audit-logs",
    "/settings",
  ],
  TENANT_ADMIN: [
    "/dashboard",
    "/services",
    "/employees",
    "/audit-logs",
    "/settings",
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
