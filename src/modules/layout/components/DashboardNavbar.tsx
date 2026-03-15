"use client";

import { Bell, CircleHelp, Menu, Search, SlidersHorizontal } from "lucide-react";
import TopIconButton from "./TopIconButton";

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  return (
    <header className="flex h-11 items-center justify-between rounded-xl border border-navbar-border bg-navbar px-3 text-primary">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="grid h-7 w-7 place-items-center rounded-md border border-icon-button-border bg-icon-button text-icon-button-text transition-colors hover:bg-icon-button-hover lg:hidden"
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
