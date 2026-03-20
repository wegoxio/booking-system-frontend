import type { DriveStep } from "driver.js";

export const TENANT_ADMIN_DASHBOARD_TOUR_VERSION = "v1";

export const TENANT_ADMIN_DASHBOARD_TOUR_STEPS: DriveStep[] = [
  {
    element: "[data-tour='dashboard-overview']",
    popover: {
      title: "Este es tu panel principal",
      description:
        "Aquí ves el resumen del negocio, sus métricas más importantes y la actividad reciente para que empieces el día con contexto.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='dashboard-nav-dashboard']",
    popover: {
      title: "Panel",
      description:
        "Vuelve aquí cuando quieras revisar el estado general del negocio y la actividad más reciente.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-nav-services']",
    popover: {
      title: "Servicios",
      description:
        "Aquí defines lo que ofreces: nombre, duración, precio, buffers y el personal que puede atender cada servicio.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-nav-employees']",
    popover: {
      title: "Empleados",
      description:
        "Desde esta vista administras el equipo, sus datos y la disponibilidad operativa de cada profesional.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-nav-bookings']",
    popover: {
      title: "Citas",
      description:
        "Aquí controlas las citas, revisas el calendario operativo y cambias estados cuando una reserva avanza o se cancela.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-nav-audit-logs']",
    popover: {
      title: "Bitácora de auditoría",
      description:
        "Este historial te ayuda a entender qué cambios se hicieron y quién los realizó dentro del negocio.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-nav-settings']",
    popover: {
      title: "Configuración",
      description:
        "Aquí ajustas branding, apariencia y configuraciones visuales del negocio para el panel y la reserva pública.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "[data-tour='dashboard-tour-trigger']",
    popover: {
      title: "Repite el recorrido cuando quieras",
      description:
        "Si necesitas volver a orientarte, usa este botón para abrir de nuevo el tour guiado.",
      side: "bottom",
      align: "end",
    },
  },
];

export const TENANT_ADMIN_DASHBOARD_TOUR_TARGETS = [
  "[data-tour='dashboard-overview']",
  "[data-tour='dashboard-nav-dashboard']",
  "[data-tour='dashboard-nav-services']",
  "[data-tour='dashboard-nav-employees']",
  "[data-tour='dashboard-nav-bookings']",
  "[data-tour='dashboard-nav-audit-logs']",
  "[data-tour='dashboard-nav-settings']",
  "[data-tour='dashboard-tour-trigger']",
];
