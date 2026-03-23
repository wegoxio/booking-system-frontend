import type { Booking, BookingStatus } from "@/types/booking.types";
import { getPhoneDisplay } from "@/modules/phone/utils/phone";
import { CalendarClock, Scissors, UserRound } from "lucide-react";

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistio",
};

const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-surface-warning-soft text-warning",
  CONFIRMED: "bg-surface-info text-info",
  IN_PROGRESS: "bg-surface-warning text-warning",
  COMPLETED: "bg-surface-success text-success",
  CANCELLED: "bg-surface-danger text-danger",
  NO_SHOW: "bg-surface-muted text-neutral",
};

type BookingsTableProps = {
  bookings: Booking[];
  updatingBookingId: string | null;
  onStatusChange: (booking: Booking, status: BookingStatus) => void;
};

const BOOKING_SOURCE_LABELS: Record<Booking["source"], string> = {
  ADMIN: "Admin",
  WEB: "Web",
  API: "API",
  MANUAL: "Manual",
};

const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
  NO_SHOW: ["NO_SHOW"],
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export default function BookingsTable({
  bookings,
  updatingBookingId,
  onStatusChange,
}: BookingsTableProps): React.ReactNode {
  return (
    <div className="mt-4">
      <div className="space-y-3 md:hidden">
        {bookings.map((booking) => {
          const customerPhoneDisplay = getPhoneDisplay({
            display: booking.customer_phone,
            countryIso2: booking.customer_phone_country_iso2,
            nationalNumber: booking.customer_phone_national_number,
            e164: booking.customer_phone_e164,
          });
          const contactDisplay = booking.customer_email ?? customerPhoneDisplay ?? "Sin contacto";

          return (
            <article
              key={booking.id}
              className="rounded-3xl border border-border-soft bg-surface p-4 shadow-theme-row"
            >
              <div className="space-y-1">
                <p className="font-semibold text-fg-strong">{booking.customer_name}</p>
                <p className="text-xs text-muted">{contactDisplay}</p>
              </div>

              <div className="mt-3 space-y-2 text-xs text-fg-secondary">
                <p className="inline-flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5" />
                  {booking.employee?.name ?? "Profesional"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateTime(booking.start_at_utc)}
                </p>
                <p className="text-muted">
                  Fin:{" "}
                  {new Date(booking.end_at_utc).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {booking.items.slice(0, 2).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-fg-secondary"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    {item.service_name_snapshot}
                  </span>
                ))}
                {booking.items.length > 2 ? (
                  <p className="text-xs text-muted">+{booking.items.length - 2} servicios</p>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-fg-secondary">
                  {formatMinutes(booking.total_duration_minutes)}
                </span>
                <span className="text-muted">
                  {booking.total_price} {booking.currency}
                </span>
                <span className="text-muted">{BOOKING_SOURCE_LABELS[booking.source]}</span>
                <span className={`rounded-full px-3 py-1.5 font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </div>

              {booking.cancellation_reason ? (
                <p className="mt-2 text-xs text-muted">Motivo: {booking.cancellation_reason}</p>
              ) : null}

              <div className="mt-3">
                <select
                  value={booking.status}
                  disabled={
                    updatingBookingId === booking.id ||
                    BOOKING_STATUS_TRANSITIONS[booking.status].length === 1
                  }
                  onChange={(event) => onStatusChange(booking, event.target.value as BookingStatus)}
                  className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover disabled:opacity-60"
                >
                  {BOOKING_STATUS_TRANSITIONS[booking.status].map((status) => (
                    <option key={status} value={status}>
                      {BOOKING_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="px-4 pb-2 font-medium">Cliente</th>
              <th className="px-4 pb-2 font-medium">Servicios</th>
              <th className="px-4 pb-2 font-medium">Profesional</th>
              <th className="px-4 pb-2 font-medium">Fecha y hora</th>
              <th className="px-4 pb-2 font-medium">Resumen</th>
              <th className="px-4 pb-2 font-medium">Estado</th>
              <th className="px-4 pb-2 font-medium">Accion</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => {
              const customerPhoneDisplay = getPhoneDisplay({
                display: booking.customer_phone,
                countryIso2: booking.customer_phone_country_iso2,
                nationalNumber: booking.customer_phone_national_number,
                e164: booking.customer_phone_e164,
              });
              const contactDisplay = booking.customer_email ?? customerPhoneDisplay ?? "Sin contacto";

              return (
                <tr key={booking.id} className="text-primary shadow-theme-row">
                  <td className="rounded-l-3xl border-y border-l border-border-soft bg-surface px-4 py-4">
                    <p className="font-semibold text-fg-strong">{booking.customer_name}</p>
                    <p className="mt-1 text-xs text-muted">{contactDisplay}</p>
                  </td>

                  <td className="border-y border-border-soft bg-surface px-4 py-4">
                    <div className="space-y-1.5">
                      {booking.items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-fg-secondary"
                        >
                          <Scissors className="h-3.5 w-3.5" />
                          {item.service_name_snapshot}
                        </div>
                      ))}
                      {booking.items.length > 2 ? (
                        <p className="text-xs text-muted">+{booking.items.length - 2} servicios</p>
                      ) : null}
                    </div>
                  </td>

                  <td className="border-y border-border-soft bg-surface px-4 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-secondary">
                      <UserRound className="h-3.5 w-3.5" />
                      {booking.employee?.name ?? "Profesional"}
                    </div>
                  </td>

                  <td className="border-y border-border-soft bg-surface px-4 py-4">
                    <div className="inline-flex items-center gap-2 text-fg-secondary">
                      <CalendarClock className="h-4 w-4 text-fg-icon" />
                      <div>
                        <p className="text-xs font-medium text-fg">{formatDateTime(booking.start_at_utc)}</p>
                        <p className="text-xs text-muted">
                          Fin:{" "}
                          {new Date(booking.end_at_utc).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-y border-border-soft bg-surface px-4 py-4">
                    <p className="text-xs font-medium text-fg-secondary">
                      {formatMinutes(booking.total_duration_minutes)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {booking.total_price} {booking.currency}
                    </p>
                    <p className="mt-1 text-xs text-muted">{BOOKING_SOURCE_LABELS[booking.source]}</p>
                  </td>

                  <td className="border-y border-border-soft bg-surface px-4 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                    {booking.cancellation_reason ? (
                      <p className="mt-2 max-w-[220px] text-xs text-muted">Motivo: {booking.cancellation_reason}</p>
                    ) : null}
                  </td>

                  <td className="rounded-r-3xl border-y border-r border-border-soft bg-surface px-4 py-4">
                    <select
                      value={booking.status}
                      disabled={
                        updatingBookingId === booking.id ||
                        BOOKING_STATUS_TRANSITIONS[booking.status].length === 1
                      }
                      onChange={(event) => onStatusChange(booking, event.target.value as BookingStatus)}
                      className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover disabled:opacity-60"
                    >
                      {BOOKING_STATUS_TRANSITIONS[booking.status].map((status) => (
                        <option key={status} value={status}>
                          {BOOKING_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
