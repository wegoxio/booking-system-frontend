"use client";

import { Bell, CircleHelp, Menu, Search, SlidersHorizontal } from "lucide-react";
import TopIconButton from "./TopIconButton";

type DashboardNavbarProps = {
  onMenuClick: () => void;
  onTourClick?: () => void;
  isTourAvailable?: boolean;
};

export default function DashboardNavbar({
  onMenuClick,
  onTourClick,
  isTourAvailable = false,
}: DashboardNavbarProps) {
  return (
    <header className="flex h-11 items-center justify-between rounded-xl border border-navbar-border bg-navbar px-3 text-primary">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Abrir navegación lateral"
          onClick={onMenuClick}
          className="grid h-7 w-7 place-items-center rounded-md border border-icon-button-border bg-icon-button text-icon-button-text transition-colors hover:bg-icon-button-hover lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <TopIconButton ariaLabel="Notificaciones">
          <Bell className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton
          ariaLabel={isTourAvailable ? "Iniciar tour guiado" : "Ayuda"}
          onClick={onTourClick}
          data-tour={isTourAvailable ? "dashboard-tour-trigger" : undefined}
          className={isTourAvailable ? "ring-1 ring-accent/25" : ""}
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton ariaLabel="Buscar">
          <Search className="h-3.5 w-3.5" />
        </TopIconButton>
        <TopIconButton ariaLabel="Filtros">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </TopIconButton>
      </div>
    </header>
  );
}
