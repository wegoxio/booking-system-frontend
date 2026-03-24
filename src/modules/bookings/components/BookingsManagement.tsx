"use client";

import { useAuth } from "@/context/AuthContext";
import BookingsCreateModal from "@/modules/bookings/components/BookingsCreateModal";
import BookingsTable from "@/modules/bookings/components/BookingsTable";
import { bookingsService } from "@/modules/bookings/services/bookings.service";
import { employeesService } from "@/modules/employees/services/employees.service";
import SectionHeader from "@/modules/ui/SectionHeader";
import TableEditModal from "@/modules/ui/TableEditModal";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import type { Booking, BookingStatus } from "@/types/booking.types";
import type { Employee } from "@/types/employee.types";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const STATUS_FILTERS: Array<{ value: "" | BookingStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistió" },
];

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim() ?? "";
const PUBLIC_BOOKING_PREFIX = "/book";

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function buildTenantBookingUrl(baseDomain: string, tenantSlug: string) {
  const normalizedDomain = trimTrailingSlashes(baseDomain.trim());
  const normalizedSlug = tenantSlug.trim();

  if (!normalizedDomain || !normalizedSlug) return "";

  return `${normalizedDomain}${PUBLIC_BOOKING_PREFIX}/${encodeURIComponent(
    normalizedSlug,
  )}`;
}

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
  const { token, user } = useAuth();

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [runtimeAppDomain, setRuntimeAppDomain] = useState("");
  const [isBookingLinkCopied, setIsBookingLinkCopied] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.is_active),
    [employees],
  );
  const isTenantAdmin = user?.role === "TENANT_ADMIN";
  const tenantSlug = user?.tenant?.slug?.trim() ?? "";
  const bookingAppDomain = APP_DOMAIN || runtimeAppDomain;
  const tenantBookingPublicUrl = useMemo(
    () => buildTenantBookingUrl(bookingAppDomain, tenantSlug),
    [bookingAppDomain, tenantSlug],
  );
  const shouldShowTenantBookingClipboard =
    isTenantAdmin && tenantSlug.length > 0;

  useEffect(() => {
    if (APP_DOMAIN) return;
    if (typeof window === "undefined") return;
    setRuntimeAppDomain(window.location.origin);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

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
      const response = await bookingsService.findAll(
        {
          status: statusFilter || undefined,
          employee_id: employeeFilter || undefined,
          date: dateFilter || undefined,
          q: debouncedSearchQuery || undefined,
          page,
          limit,
        },
        token,
      );
      setBookings(response.data);
      setTotalBookings(response.pagination.total);
      setTotalPages(response.pagination.total_pages);

      if (page > response.pagination.total_pages) {
        setPage(response.pagination.total_pages);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar las citas.";
      setBookings([]);
      setTotalBookings(0);
      setTotalPages(1);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [
    dateFilter,
    debouncedSearchQuery,
    employeeFilter,
    limit,
    page,
    statusFilter,
    token,
  ]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, employeeFilter, dateFilter, debouncedSearchQuery]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

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

  const bookingsStats = [
    { label: "Citas", value: totalBookings },
    { label: "Hoy", value: bookingsTodayCount },
    { label: "Activos", value: pendingBookingsCount },
  ];
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter.length > 0 ||
    employeeFilter.length > 0 ||
    dateFilter.length > 0;

  const handleCopyTenantBookingUrl = useCallback(async () => {
    if (!tenantBookingPublicUrl) {
      toast.error("No se pudo construir la URL publica para compartir.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast.error("Tu navegador no permite copiar al portapapeles.");
      return;
    }

    try {
      await navigator.clipboard.writeText(tenantBookingPublicUrl);
      setIsBookingLinkCopied(true);
      toast.success("URL de reservas copiada.");
    } catch {
      toast.error("No se pudo copiar la URL.");
    }
  }, [tenantBookingPublicUrl]);

  useEffect(() => {
    if (!isBookingLinkCopied) return;

    const timeout = window.setTimeout(() => {
      setIsBookingLinkCopied(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isBookingLinkCopied]);

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
      toast.success("Estado de cita actualizado.");
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

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleStatusModalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !pendingStatusChange) return;

    if (
      isCancellationStatus(pendingStatusChange.status) &&
      cancellationReason.trim().length === 0
    ) {
      setModalError("Debes indicar un motivo para cancelar o marcar como no asistió.");
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
          ? "Cita marcada como completada."
          : "Estado de cita actualizado.",
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
      <SectionHeader
        headerTitle="Citas"
        headerDescription="Agenda citas por profesional con slots reales según servicios y disponibilidad."
        stats={bookingsStats}
      />

      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-fg-strong">Citas agendadas</h3>
            <p className="text-sm text-muted">
              Controla estados, profesionales y agenda diaria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {shouldShowTenantBookingClipboard ? (
              <button
                type="button"
                disabled={!tenantBookingPublicUrl}
                onClick={() => {
                  void handleCopyTenantBookingUrl();
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  tenantBookingPublicUrl
                    ? "border-border-strong bg-surface text-fg hover:bg-surface-hover"
                    : "cursor-not-allowed border-border bg-surface text-muted"
                }`}
              >
                {isBookingLinkCopied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {isBookingLinkCopied ? "URL copiada" : "Copiar URL booking"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-text shadow-theme-accent transition hover:brightness-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Registrar cita
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <label className="relative min-w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-placeholder" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition focus:border-accent"
                placeholder="Buscar cita..."
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

        {errorMessage ? <p className="mt-4 text-sm text-danger">{errorMessage}</p> : null}

        {isLoadingMeta || isLoadingBookings ? (
          <TableSkeleton />
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
            <p className="text-base font-medium text-fg">
              {hasActiveFilters
                ? "No hay resultados para los filtros actuales."
                : "No hay citas registradas todavia."}
            </p>
              <p className="mt-2 text-sm text-muted">
                Agenda una cita o ajusta filtros para visualizar la información.
              </p>
          </div>
        ) : (
          <BookingsTable
            bookings={bookings}
            updatingBookingId={updatingBookingId}
            onStatusChange={(booking, status) => {
              void handleBookingStatusChange(booking, status);
            }}
          />
        )}

        {!isLoadingBookings && totalBookings > 0 ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted">
              Mostrando {(page - 1) * limit + 1}-{(page - 1) * limit + bookings.length} de{" "}
              {totalBookings} citas.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isLoadingBookings}
                className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isLoadingBookings}
                className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <BookingsCreateModal
        isOpen={isCreateModalOpen}
        token={token}
        onClose={closeCreateModal}
        onBookingCreated={loadBookings}
      />

      <TableEditModal
        isOpen={pendingStatusChange !== null}
        badgeLabel={
          pendingStatusChange?.status === "COMPLETED"
            ? "Cerrar cita"
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
              ? "Marcar cita como no asistió"
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
            : "Este motivo quedará guardado y visible en la gestión de citas."
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
                    ? "No asistió"
                    : "Cancelada"}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              {pendingStatusChange?.status === "COMPLETED"
                ? "Esta cita dejará de estar activa y contará como atendida."
                : "La cita dejará de bloquear agenda y el motivo quedará trazado."}
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
                    ? "Ej: el cliente no se presentó a la cita."
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
