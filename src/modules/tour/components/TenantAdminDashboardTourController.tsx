"use client";

import type { Driver, DriveStep } from "driver.js";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  TENANT_ADMIN_DASHBOARD_TOUR_STEPS,
  TENANT_ADMIN_DASHBOARD_TOUR_TARGETS,
  TENANT_ADMIN_DASHBOARD_TOUR_VERSION,
} from "@/modules/tour/config/tenant-admin-dashboard-tour";
import {
  buildTourStorageKey,
  isTourCompleted,
  markTourCompleted,
} from "@/modules/tour/services/tour-storage";

type TenantAdminDashboardTourControllerProps = {
  isEnabled: boolean;
  userId: string;
  runNonce: number;
};

const TOUR_SCOPE = "tenant-admin-dashboard";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

async function waitForTourTargets(selectors: string[]): Promise<boolean> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const hasAllTargets = selectors.every((selector) =>
      Boolean(document.querySelector(selector)),
    );

    if (hasAllTargets) {
      return true;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 160));
  }

  return false;
}

export default function TenantAdminDashboardTourController({
  isEnabled,
  userId,
  runNonce,
}: TenantAdminDashboardTourControllerProps) {
  const driverRef = useRef<Driver | null>(null);
  const isRunningRef = useRef(false);
  const lastManualRunRef = useRef(0);
  const autoStartedRef = useRef(false);

  const storageKey = buildTourStorageKey({
    scope: TOUR_SCOPE,
    version: TENANT_ADMIN_DASHBOARD_TOUR_VERSION,
    userId,
  });

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
      isRunningRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      driverRef.current?.destroy();
      driverRef.current = null;
      isRunningRef.current = false;
      autoStartedRef.current = false;
      return;
    }

    if (autoStartedRef.current || isTourCompleted(storageKey)) {
      return;
    }

    if (!isDesktopViewport()) {
      return;
    }

    autoStartedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void startTour("auto");
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [isEnabled, storageKey]);

  useEffect(() => {
    if (!isEnabled || runNonce === 0 || runNonce === lastManualRunRef.current) {
      return;
    }

    lastManualRunRef.current = runNonce;
    void startTour("manual");
  }, [isEnabled, runNonce]);

  async function startTour(mode: "auto" | "manual"): Promise<void> {
    if (isRunningRef.current) {
      return;
    }

    if (!isDesktopViewport()) {
      if (mode === "manual") {
        toast("El tour guiado por ahora esta optimizado para escritorio.");
      }
      return;
    }

    const hasTargets = await waitForTourTargets(TENANT_ADMIN_DASHBOARD_TOUR_TARGETS);
    if (!hasTargets) {
      return;
    }

    const { driver } = await import("driver.js");
    driverRef.current?.destroy();

    const instance = driver({
      steps: TENANT_ADMIN_DASHBOARD_TOUR_STEPS as DriveStep[],
      animate: true,
      smoothScroll: true,
      allowClose: true,
      showProgress: true,
      stagePadding: 10,
      stageRadius: 18,
      overlayOpacity: 0.58,
      overlayColor: "rgba(24, 32, 49, 0.82)",
      popoverClass: "wegox-tour-popover",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Listo",
      onDestroyed: () => {
        markTourCompleted(storageKey);
        driverRef.current = null;
        isRunningRef.current = false;
      },
    });

    driverRef.current = instance;
    isRunningRef.current = true;
    instance.drive();
  }

  return null;
}
