"use client";

import { Bell, CircleHelp, Menu, Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

function TopIconButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="grid h-7 w-7 place-items-center rounded-full border border-[#d8dae1] bg-white text-[#686d79] hover:bg-[#f6f7fa]"
    >
      {children}
    </button>
  );
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  return (
    <header className="flex h-11 items-center justify-between rounded-xl border border-[#e5e6eb] bg-[#ececef] px-3 text-[#2d313b]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="grid h-7 w-7 place-items-center rounded-md border border-[#d8dae1] bg-white text-[#626774] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <img src="/wegox-logo.svg" alt="Wegox" className="h-5 w-5" />
        <span className="text-sm font-medium text-[#3b404c]">Dashboard</span>
      </div>

      <div className="flex items-center gap-2">
        <TopIconButton ariaLabel="Notifications">
          <Bell className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton ariaLabel="Help">
          <CircleHelp className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton ariaLabel="Search">
          <Search className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton ariaLabel="Filters">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </TopIconButton>
      </div>
    </header>
  );
}
