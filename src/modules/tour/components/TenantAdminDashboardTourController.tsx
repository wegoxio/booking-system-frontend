"use client";

import type { Driver, DriveStep } from "driver.js";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  TENANT_ADMIN_DASHBOARD_TOUR_STEPS,
  TENANT_ADMIN_DASHBOARD_TOUR_TARGETS,
} from "@/modules/tour/config/tenant-admin-dashboard-tour";

type TenantAdminDashboardTourControllerProps = {
  isEnabled: boolean;
  tourCompletedAt: string | null;
  onTourCompleted?: () => Promise<void> | void;
  runNonce: number;
};

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

async function waitForTourTargets(selectors: string[]): Promise<boolean> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
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
  tourCompletedAt,
  onTourCompleted,
  runNonce,
}: TenantAdminDashboardTourControllerProps) {
  const driverRef = useRef<Driver | null>(null);
  const isRunningRef = useRef(false);
  const lastManualRunRef = useRef(0);
  const autoStartedRef = useRef(false);
  const completedAtRef = useRef<string | null>(tourCompletedAt);

  useEffect(() => {
    completedAtRef.current = tourCompletedAt;
  }, [tourCompletedAt]);

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

    if (autoStartedRef.current || Boolean(tourCompletedAt)) {
      return;
    }

    if (!isDesktopViewport()) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          if (cancelled || autoStartedRef.current) {
            return;
          }

          const started = await startTour("auto");
          if (started) {
            autoStartedRef.current = true;
            return;
          }

          await new Promise((resolve) => window.setTimeout(resolve, 280));
        }
      })();
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isEnabled, tourCompletedAt]);

  useEffect(() => {
    if (!isEnabled || runNonce === 0 || runNonce === lastManualRunRef.current) {
      return;
    }

    lastManualRunRef.current = runNonce;
    void startTour("manual");
  }, [isEnabled, runNonce]);

  async function startTour(mode: "auto" | "manual"): Promise<boolean> {
    if (isRunningRef.current) {
      return false;
    }

    if (!isDesktopViewport()) {
      if (mode === "manual") {
        toast("El tour guiado por ahora está optimizado para escritorio.");
      }
      return false;
    }

    const hasTargets = await waitForTourTargets(TENANT_ADMIN_DASHBOARD_TOUR_TARGETS);
    if (!hasTargets) {
      return false;
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
        driverRef.current = null;
        isRunningRef.current = false;
        if (!completedAtRef.current) {
          void onTourCompleted?.();
        }
      },
    });

    driverRef.current = instance;
    isRunningRef.current = true;
    instance.drive();
    return true;
  }

  return null;
}
