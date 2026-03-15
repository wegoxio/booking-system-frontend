import Avatar from "@/modules/ui/Avatar";
import type { BookingSlot } from "@/types/booking.types";
import type { Employee } from "@/types/employee.types";
import type { Service } from "@/types/service.types";
import { CalendarDays, Clock3, Scissors, UserRound } from "lucide-react";
import { useMemo } from "react";

export type BookingCustomerFormState = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
};

type BookingComposerProps = {
  services: Service[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  eligibleEmployees: Employee[];
  isLoadingEligibleEmployees: boolean;
  selectedEmployeeId: string;
  onSelectEmployee: (employeeId: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  slots: BookingSlot[];
  isLoadingSlots: boolean;
  selectedSlotStart: string | null;
  onSelectSlot: (slotStart: string) => void;
  requiredDurationMinutes: number | null;
  availabilityTimezone: string | null;
  customerForm: BookingCustomerFormState;
  onCustomerFormChange: (next: BookingCustomerFormState) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage: string;
  isReadyToSubmit: boolean;
};

function getTodayDateInput() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatSlotTime(iso: string, timeZone?: string | null) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

function formatSlotDate(iso: string, timeZone?: string | null) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    ...(timeZone ? { timeZone } : {}),
  });
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "--";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export default function BookingComposer({
  services,
  selectedServiceIds,
  onToggleService,
  eligibleEmployees,
  isLoadingEligibleEmployees,
  selectedEmployeeId,
  onSelectEmployee,
  selectedDate,
  onDateChange,
  slots,
  isLoadingSlots,
  selectedSlotStart,
  onSelectSlot,
  requiredDurationMinutes,
  availabilityTimezone,
  customerForm,
  onCustomerFormChange,
  onSubmit,
  isSubmitting,
  errorMessage,
  isReadyToSubmit,
}: BookingComposerProps): React.ReactNode {
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds],
  );

  const selectedEmployee = useMemo(
    () => eligibleEmployees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [eligibleEmployees, selectedEmployeeId],
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.start_at_utc === selectedSlotStart) ?? null,
    [slots, selectedSlotStart],
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (sum, service) => sum + Number(service.price),
        0,
      ),
    [selectedServices],
  );

  return (
    <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-fg-strong">Agendar cita</h3>
        <p className="text-sm text-muted">
          Flujo rapido: servicios, profesional, fecha y slot disponible.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-warning px-3 py-1 text-xs font-semibold text-warning">
            1
            <span className="uppercase tracking-[0.14em]">Servicios</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onToggleService(service.id)}
                  className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-accent bg-surface-warning-soft"
                      : "border-border-soft bg-surface hover:border-border"
                  }`}
                >
                  <p className="text-sm font-semibold text-fg-strong">{service.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {service.duration_minutes} min · {service.price} {service.currency}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-3xl border border-border-soft bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Resumen de cita
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs text-muted">Servicios</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedServices.length === 0 ? (
                    <span className="text-xs text-muted">Selecciona al menos uno</span>
                  ) : (
                    selectedServices.map((service) => (
                      <span
                        key={service.id}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] text-fg-secondary"
                      >
                        <Scissors className="h-3 w-3" />
                        {service.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted">Profesional</p>
                <p className="mt-1 text-sm font-medium text-fg">
                  {selectedEmployee?.name ?? "Pendiente"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Duracion estimada</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-fg">
                  <Clock3 className="h-4 w-4 text-fg-icon" />
                  {formatDuration(requiredDurationMinutes)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Total estimado</p>
                <p className="mt-1 text-sm font-semibold text-fg-strong">
                  {totalPrice.toFixed(2)} {selectedServices[0]?.currency ?? "USD"}
                </p>
              </div>

              {selectedSlot ? (
                <div className="rounded-xl border border-border-soft bg-surface-soft p-3">
                  <p className="text-xs text-muted">Slot seleccionado</p>
                  <p className="mt-1 text-sm font-medium text-fg">
                    {formatSlotDate(selectedSlot.start_at_utc, availabilityTimezone)} ·{" "}
                    {formatSlotTime(selectedSlot.start_at_utc, availabilityTimezone)}
                  </p>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="space-y-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-warning px-3 py-1 text-xs font-semibold text-warning">
                2
                <span className="uppercase tracking-[0.14em]">Profesional</span>
              </div>

              {selectedServiceIds.length === 0 ? (
                <p className="rounded-2xl border border-border-soft bg-surface px-3 py-3 text-sm text-muted">
                  Selecciona servicios para mostrar profesionales compatibles.
                </p>
              ) : isLoadingEligibleEmployees ? (
                <p className="rounded-2xl border border-border-soft bg-surface px-3 py-3 text-sm text-muted">
                  Buscando profesionales...
                </p>
              ) : eligibleEmployees.length === 0 ? (
                <p className="rounded-2xl border border-border-soft bg-surface px-3 py-3 text-sm text-muted">
                  No hay profesionales activos para esta combinacion de servicios.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {eligibleEmployees.map((employee) => {
                    const selected = selectedEmployeeId === employee.id;
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => onSelectEmployee(employee.id)}
                        className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                          selected
                            ? "border-accent bg-surface-warning-soft"
                            : "border-border-soft bg-surface hover:border-border"
                        }`}
                      >
                        <Avatar name={employee.name} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-fg">
                            {employee.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {employee.email}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-warning px-3 py-1 text-xs font-semibold text-warning">
                3
                <span className="uppercase tracking-[0.14em]">Fecha y hora</span>
              </div>

              <div className="rounded-2xl border border-border-soft bg-surface p-3">
                <label className="mb-2 block text-xs font-medium text-fg-label">Fecha</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-icon" />
                  <input
                    type="date"
                    min={getTodayDateInput()}
                    value={selectedDate}
                    onChange={(event) => onDateChange(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-soft py-2.5 pl-9 pr-3 text-sm text-fg"
                  />
                </div>

                <label className="mt-3 mb-2 block text-xs font-medium text-fg-label">
                  Slots disponibles
                </label>
                {isLoadingSlots ? (
                  <p className="text-sm text-muted">Calculando disponibilidad...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted">
                    No hay slots para la fecha seleccionada.
                  </p>
                ) : (
                  <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isSelected = slot.start_at_utc === selectedSlotStart;
                      return (
                        <button
                          key={slot.start_at_utc}
                          type="button"
                          onClick={() => onSelectSlot(slot.start_at_utc)}
                          className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition ${
                            isSelected
                              ? "border-accent bg-accent text-accent-text"
                              : "border-border-soft bg-surface-soft text-fg-secondary hover:bg-surface-muted"
                          }`}
                        >
                          {formatSlotTime(slot.start_at_utc, availabilityTimezone)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-warning px-3 py-1 text-xs font-semibold text-warning">
            4
            <span className="uppercase tracking-[0.14em]">Cliente</span>
          </div>

          <div className="grid gap-3 rounded-2xl border border-border-soft bg-surface p-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-label">Nombre</span>
              <input
                value={customerForm.customer_name}
                onChange={(event) =>
                  onCustomerFormChange({
                    ...customerForm,
                    customer_name: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-fg"
                placeholder="Ej: Carlos Ruiz"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-label">Email</span>
              <input
                value={customerForm.customer_email}
                onChange={(event) =>
                  onCustomerFormChange({
                    ...customerForm,
                    customer_email: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-fg"
                placeholder="cliente@correo.com"
                type="email"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-label">Telefono</span>
              <input
                value={customerForm.customer_phone}
                onChange={(event) =>
                  onCustomerFormChange({
                    ...customerForm,
                    customer_phone: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-fg"
                placeholder="+34 600 000 000"
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-medium text-fg-label">Notas</span>
              <textarea
                value={customerForm.notes}
                onChange={(event) =>
                  onCustomerFormChange({
                    ...customerForm,
                    notes: event.target.value,
                  })
                }
                className="h-20 w-full resize-none rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-fg"
                placeholder="Detalles adicionales de la cita..."
              />
            </label>
          </div>
        </div>

        {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Solo se muestran slots realmente disponibles para ese profesional.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isReadyToSubmit || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-text shadow-theme-accent disabled:opacity-60"
          >
            <UserRound className="h-4 w-4" />
            {isSubmitting ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
