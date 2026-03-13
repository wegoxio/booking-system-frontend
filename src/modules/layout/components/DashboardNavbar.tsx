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
      className="grid h-7 w-7 place-items-center rounded-full border border-[var(--icon-button-border)] bg-[var(--icon-button-bg)] text-[var(--icon-button-text)] transition-colors hover:brightness-[0.98]"
    >
      {children}
    </button>
  );
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  return (
    <header className="flex h-11 items-center justify-between rounded-xl border border-[var(--navbar-border)] bg-[var(--navbar-bg)] px-3 text-[var(--text-primary)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="grid h-7 w-7 place-items-center rounded-md border border-[var(--icon-button-border)] bg-[var(--icon-button-bg)] text-[var(--icon-button-text)] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
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
