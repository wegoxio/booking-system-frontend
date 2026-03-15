"use client";

import { useAuth } from "@/context/AuthContext";
import BookingsTable from "@/modules/bookings/components/BookingsTable";
import { bookingsService } from "@/modules/bookings/services/bookings.service";
import { employeesService } from "@/modules/employees/services/employees.service";
import TableEditModal from "@/modules/ui/TableEditModal";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import TableStatsCard from "@/modules/ui/TableStatsCard";
import type { Booking, BookingStatus } from "@/types/booking.types";
import type { Employee } from "@/types/employee.types";
import { CheckCircle2, CircleAlert, Search, XCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const STATUS_FILTERS: Array<{ value: "" | BookingStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistio" },
];

function getTodayDateInput() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type PendingStatusChange = {
  booking: Booking;
  status: BookingStatus;
};

function isCancellationStatus(status: BookingStatus) {
  return status === "CANCELLED" || status === "NO_SHOW";
}

export default function BookingsManagement() {
  const { token } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | BookingStatus>("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.is_active),
    [employees],
  );

  const loadMeta = useCallback(async () => {
    if (!token) return;
    setIsLoadingMeta(true);
    setErrorMessage("");
    try {
      const employeesData = await employeesService.findAll(token);
      setEmployees(employeesData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar empleados.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoadingMeta(false);
    }
  }, [token]);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setIsLoadingBookings(true);
    setErrorMessage("");

    try {
      const data = await bookingsService.findAll(
        {
          status: statusFilter || undefined,
          employee_id: employeeFilter || undefined,
          date: dateFilter || undefined,
        },
        token,
      );
      setBookings(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar bookings.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [dateFilter, employeeFilter, statusFilter, token]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return bookings;

    return bookings.filter((booking) => {
      const servicesText = booking.items
        .map((item) => item.service_name_snapshot)
        .join(" ");
      const haystack =
        `${booking.customer_name} ${booking.customer_email ?? ""} ${booking.customer_phone ?? ""} ${booking.employee?.name ?? ""} ${servicesText}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [bookings, searchQuery]);

  const bookingsTodayCount = useMemo(() => {
    const today = getTodayDateInput();
    return bookings.filter((booking) => booking.start_at_utc.slice(0, 10) === today).length;
  }, [bookings]);

  const pendingBookingsCount = useMemo(
    () =>
      bookings.filter((booking) =>
        ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(booking.status),
      ).length,
    [bookings],
  );

  const handleBookingStatusChange = async (booking: Booking, status: BookingStatus) => {
    if (!token) return;
    if (booking.status === status) return;

    if (status === "COMPLETED" || isCancellationStatus(status)) {
      setPendingStatusChange({ booking, status });
      setCancellationReason(
        isCancellationStatus(status) ? booking.cancellation_reason ?? "" : "",
      );
      setModalError("");
      return;
    }

    setUpdatingBookingId(booking.id);
    setErrorMessage("");
    try {
      await bookingsService.updateStatus(booking.id, { status }, token);
      await loadBookings();
      toast.success("Estado de booking actualizado.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el estado.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const closeStatusModal = useCallback(() => {
    if (updatingBookingId) return;
    setPendingStatusChange(null);
    setCancellationReason("");
    setModalError("");
  }, [updatingBookingId]);

  const handleStatusModalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !pendingStatusChange) return;

    if (
      isCancellationStatus(pendingStatusChange.status) &&
      cancellationReason.trim().length === 0
    ) {
      setModalError("Debes indicar un motivo para cancelar o marcar como no asistio.");
      return;
    }

    setUpdatingBookingId(pendingStatusChange.booking.id);
    setModalError("");
    setErrorMessage("");

    try {
      await bookingsService.updateStatus(
        pendingStatusChange.booking.id,
        {
          status: pendingStatusChange.status,
          cancellation_reason: isCancellationStatus(pendingStatusChange.status)
            ? cancellationReason.trim()
            : undefined,
        },
        token,
      );
      await loadBookings();
      toast.success(
        pendingStatusChange.status === "COMPLETED"
          ? "Booking marcada como completada."
          : "Estado de booking actualizado.",
      );
      closeStatusModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el estado.";
      setModalError(message);
      toast.error(message);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-card-border bg-gradient-to-br from-surface-warm to-surface-soft p-6 shadow-theme-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg-strong">
              Bookings
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-muted">
              Agenda citas por profesional con slots reales segun servicios y disponibilidad.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TableStatsCard label="Bookings" value={bookings.length} />
            <TableStatsCard label="Hoy" value={bookingsTodayCount} />
            <TableStatsCard label="Activos" value={pendingBookingsCount} />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-fg-strong">Citas agendadas</h3>
            <p className="text-sm text-muted">
              Controla estados, profesionales y agenda diaria.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative min-w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-placeholder" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition focus:border-accent"
                placeholder="Buscar booking..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "" | BookingStatus)}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status.value || "all"} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
            >
              <option value="">Todos los profesionales</option>
              {activeEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
            />
          </div>
        </div>

        {errorMessage ? <p className="mt-4 text-sm text-danger">{errorMessage}</p> : null}

        {isLoadingMeta || isLoadingBookings ? (
          <TableSkeleton />
        ) : filteredBookings.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
            <p className="text-base font-medium text-fg">
              {bookings.length === 0
                ? "No hay bookings registrados todavia."
                : "No hay resultados para los filtros actuales."}
            </p>
            <p className="mt-2 text-sm text-muted">
              Agenda una cita o ajusta filtros para visualizar la informacion.
            </p>
          </div>
        ) : (
          <BookingsTable
            bookings={filteredBookings}
            updatingBookingId={updatingBookingId}
            onStatusChange={(booking, status) => {
              void handleBookingStatusChange(booking, status);
            }}
          />
        )}
      </div>

      <TableEditModal
        isOpen={pendingStatusChange !== null}
        badgeLabel={
          pendingStatusChange?.status === "COMPLETED"
            ? "Cerrar booking"
            : "Actualizar estado"
        }
        badgeIcon={
          pendingStatusChange?.status === "COMPLETED" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <CircleAlert className="h-3.5 w-3.5" />
          )
        }
        title={
          pendingStatusChange?.status === "COMPLETED"
            ? "Marcar cita como completada"
            : pendingStatusChange?.status === "NO_SHOW"
              ? "Marcar cita como no asistio"
              : "Cancelar cita"
        }
        description={
          pendingStatusChange
            ? `Cliente: ${pendingStatusChange.booking.customer_name}. Profesional: ${pendingStatusChange.booking.employee?.name ?? "N/A"}.`
            : ""
        }
        helperText={
          pendingStatusChange?.status === "COMPLETED"
            ? "Confirma solo cuando el servicio ya fue realizado."
            : "Este motivo quedara guardado y visible en la gestion de bookings."
        }
        errorMessage={modalError}
        submitText={
          updatingBookingId
            ? "Guardando..."
            : pendingStatusChange?.status === "COMPLETED"
              ? "Confirmar completada"
              : "Guardar motivo"
        }
        isSubmitting={updatingBookingId !== null}
        maxWidthClassName="max-w-2xl"
        onClose={closeStatusModal}
        onSubmit={handleStatusModalSubmit}
      >
        <div className="space-y-4">
          <div className="rounded-3xl border border-border-soft bg-surface px-4 py-4">
            <p className="text-sm font-medium text-fg-strong">
              Nuevo estado:
              <span className="ml-2 inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-fg-secondary">
                {pendingStatusChange?.status === "COMPLETED"
                  ? "Completada"
                  : pendingStatusChange?.status === "NO_SHOW"
                    ? "No asistio"
                    : "Cancelada"}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              {pendingStatusChange?.status === "COMPLETED"
                ? "Esta cita dejara de estar activa y contara como atendida."
                : "La cita dejara de bloquear agenda y el motivo quedara trazado."}
            </p>
          </div>

          {pendingStatusChange && isCancellationStatus(pendingStatusChange.status) ? (
            <label className="block space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-fg-label">
                <XCircle className="h-4 w-4 text-danger" />
                Motivo
              </span>
              <textarea
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                rows={5}
                maxLength={500}
                className="w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none transition focus:border-accent"
                placeholder={
                  pendingStatusChange.status === "NO_SHOW"
                    ? "Ej: el cliente no se presento a la cita."
                    : "Ej: el cliente canceló, hubo un problema operativo, reagendado, etc."
                }
              />
              <p className="text-xs text-muted">
                {cancellationReason.trim().length}/500 caracteres
              </p>
            </label>
          ) : null}
        </div>
      </TableEditModal>
    </section>
  );
}
