import { ReactNode } from "react";
import DashboardShell from "@/modules/layout/components/DashboardShell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
