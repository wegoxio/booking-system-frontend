import type { Booking, BookingStatus } from "@/types/booking.types";
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
    <div className="mt-4 overflow-x-auto">
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
          {bookings.map((booking) => (
            <tr key={booking.id} className="text-primary shadow-theme-row">
              <td className="rounded-l-3xl border-y border-l border-border-soft bg-surface px-4 py-4">
                <p className="font-semibold text-fg-strong">{booking.customer_name}</p>
                <p className="mt-1 text-xs text-muted">
                  {booking.customer_email ?? booking.customer_phone ?? "Sin contacto"}
                </p>
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
                      Fin: {new Date(booking.end_at_utc).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
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
                <p className="mt-1 text-xs text-muted">{booking.source}</p>
              </td>

              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}
                >
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </td>

              <td className="rounded-r-3xl border-y border-r border-border-soft bg-surface px-4 py-4">
                <select
                  value={booking.status}
                  disabled={updatingBookingId === booking.id}
                  onChange={(event) => onStatusChange(booking, event.target.value as BookingStatus)}
                  className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral disabled:opacity-60"
                >
                  {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {BOOKING_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
