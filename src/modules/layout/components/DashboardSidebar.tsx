"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Bell, ChevronDown, Home, LogOut, Settings, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/modules/ui/Avatar";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  isOpen: boolean;
  onClose: () => void;
};

export default function DashboardSidebar({
  items,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar overlay"
        className={`absolute inset-0 z-30 bg-black/30 lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute inset-y-0 left-0 z-40 w-[250px] border-r border-white/15 bg-gradient-to-b from-[#5f6470] to-[#4a4f5b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-200 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-5 rounded-xl bg-black/20 px-4 py-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/wegox-logo.svg" alt="Wegox logo" className="h-6 w-6" />
              <span className="text-[31px] font-semibold leading-none tracking-tight">
                wegox
              </span>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {items.map((item) => {
              const itemHref = item.href || "/dashboard";
              const isActive =
                pathname === itemHref || pathname.startsWith(`${itemHref}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={itemHref}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#efc35f] text-[#353a46]"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#424858]" : "text-white/80"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg bg-black/20 px-2.5 py-2.5 text-left text-white/95"
            >
              <Avatar name={user?.name ?? "Super Admin"} className="h-8 w-8 text-[10px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold leading-none">
                  {user?.name ?? "Super Admin"}
                </span>
                <span className="mt-1 block truncate text-[10px] text-white/60">
                  {user?.email ?? "admin@wegox.com"}
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-white/70" />
            </button>

            <div className="flex items-center justify-center gap-1 rounded-lg bg-black/20 p-1">
              <button className="grid h-7 w-7 place-items-center rounded-md text-white/75 hover:bg-white/10">
                <Home className="h-3.5 w-3.5" />
              </button>
              <button className="grid h-7 w-7 place-items-center rounded-md text-white/75 hover:bg-white/10">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <button className="grid h-7 w-7 place-items-center rounded-md text-white/75 hover:bg-white/10">
                <Star className="h-3.5 w-3.5" />
              </button>
              <button className="grid h-7 w-7 place-items-center rounded-md text-white/75 hover:bg-white/10">
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-7 w-7 place-items-center rounded-md text-white/80 hover:bg-white/10"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
