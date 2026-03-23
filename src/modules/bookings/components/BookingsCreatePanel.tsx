"use client";

import BookingComposer, { type BookingCustomerFormState } from "@/modules/bookings/components/BookingComposer";
import ManualBookingComposer, {
  type ManualBookingStatusSelection,
} from "@/modules/bookings/components/ManualBookingComposer";
import { bookingsService } from "@/modules/bookings/services/bookings.service";
import { validateOptionalPhoneValue } from "@/modules/phone/utils/phone";
import { servicesService } from "@/modules/services/services/services.service";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import type { Employee } from "@/types/employee.types";
import type { Service } from "@/types/service.types";
import { Clock3, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type BookingsCreatePanelProps = {
  token: string | null;
  onBookingCreated?: () => Promise<void> | void;
  variant?: "page" | "modal";
};

type CreationTab = "availability" | "manual";

const INITIAL_CUSTOMER_FORM: BookingCustomerFormState = {
  customer_name: "",
  customer_email: "",
  customer_phone_country_iso2: "",
  customer_phone_national_number: "",
  notes: "",
};

function getTodayDateInput() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getRoundedCurrentTime() {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function buildLocalDateTimeToIso(date: string, time: string) {
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function isCancellationStatus(status: ManualBookingStatusSelection) {
  return status === "CANCELLED" || status === "NO_SHOW";
}

export default function BookingsCreatePanel({
  token,
  onBookingCreated,
  variant = "page",
}: BookingsCreatePanelProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<CreationTab>("availability");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [strictSelectedServiceIds, setStrictSelectedServiceIds] = useState<string[]>([]);
  const [strictEligibleEmployees, setStrictEligibleEmployees] = useState<Employee[]>([]);
  const [isLoadingStrictEmployees, setIsLoadingStrictEmployees] = useState(false);
  const [strictSelectedEmployeeId, setStrictSelectedEmployeeId] = useState("");
  const [strictDate, setStrictDate] = useState(getTodayDateInput());
  const [strictSlots, setStrictSlots] = useState<Array<{ start_at_utc: string; end_at_utc: string }>>([]);
  const [isLoadingStrictSlots, setIsLoadingStrictSlots] = useState(false);
  const [strictSelectedSlotStart, setStrictSelectedSlotStart] = useState<string | null>(null);
  const [strictRequiredDurationMinutes, setStrictRequiredDurationMinutes] = useState<number | null>(null);
  const [strictAvailabilityTimezone, setStrictAvailabilityTimezone] = useState<string | null>(null);
  const [strictCustomerForm, setStrictCustomerForm] = useState<BookingCustomerFormState>(INITIAL_CUSTOMER_FORM);
  const [strictErrorMessage, setStrictErrorMessage] = useState("");
  const [isSubmittingStrict, setIsSubmittingStrict] = useState(false);

  const [manualSelectedServiceIds, setManualSelectedServiceIds] = useState<string[]>([]);
  const [manualEligibleEmployees, setManualEligibleEmployees] = useState<Employee[]>([]);
  const [isLoadingManualEmployees, setIsLoadingManualEmployees] = useState(false);
  const [manualSelectedEmployeeId, setManualSelectedEmployeeId] = useState("");
  const [manualDate, setManualDate] = useState(getTodayDateInput());
  const [manualTime, setManualTime] = useState(getRoundedCurrentTime());
  const [manualStatus, setManualStatus] = useState<ManualBookingStatusSelection>("");
  const [manualAllowOverlap, setManualAllowOverlap] = useState(false);
  const [manualCancellationReason, setManualCancellationReason] = useState("");
  const [manualCustomerForm, setManualCustomerForm] = useState<BookingCustomerFormState>(INITIAL_CUSTOMER_FORM);
  const [manualErrorMessage, setManualErrorMessage] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const activeServices = useMemo(
    () => services.filter((service) => service.is_active),
    [services],
  );

  const manualSelectedServices = useMemo(
    () => activeServices.filter((service) => manualSelectedServiceIds.includes(service.id)),
    [activeServices, manualSelectedServiceIds],
  );

  const manualEstimatedDurationMinutes = useMemo(
    () =>
      manualSelectedServices.reduce(
        (total, service) =>
          total +
          service.duration_minutes +
          service.buffer_before_minutes +
          service.buffer_after_minutes,
        0,
      ),
    [manualSelectedServices],
  );

  const manualEstimatedTotal = useMemo(
    () => manualSelectedServices.reduce((sum, service) => sum + Number(service.price), 0),
    [manualSelectedServices],
  );

  const loadServices = useCallback(async () => {
    if (!token) return;
    setIsLoadingServices(true);
    setLoadError("");
    try {
      const data = await servicesService.findAll(token);
      setServices(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar los servicios.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoadingServices(false);
    }
  }, [token]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (!token || strictSelectedServiceIds.length === 0) {
      setStrictEligibleEmployees([]);
      setStrictSelectedEmployeeId("");
      return;
    }

    let isCancelled = false;
    setIsLoadingStrictEmployees(true);

    (async () => {
      try {
        const data = await bookingsService.findEligibleEmployees(strictSelectedServiceIds, token);
        if (isCancelled) return;
        setStrictEligibleEmployees(data);
        setStrictSelectedEmployeeId((prev) =>
          data.some((employee) => employee.id === prev) ? prev : "",
        );
      } catch (error) {
        if (isCancelled) return;
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar profesionales.";
        setStrictEligibleEmployees([]);
        setStrictSelectedEmployeeId("");
        setStrictErrorMessage(message);
        toast.error(message);
      } finally {
        if (!isCancelled) {
          setIsLoadingStrictEmployees(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [strictSelectedServiceIds, token]);

  useEffect(() => {
    if (!token || manualSelectedServiceIds.length === 0) {
      setManualEligibleEmployees([]);
      setManualSelectedEmployeeId("");
      return;
    }

    let isCancelled = false;
    setIsLoadingManualEmployees(true);

    (async () => {
      try {
        const data = await bookingsService.findEligibleEmployees(manualSelectedServiceIds, token);
        if (isCancelled) return;
        setManualEligibleEmployees(data);
        setManualSelectedEmployeeId((prev) =>
          data.some((employee) => employee.id === prev) ? prev : "",
        );
      } catch (error) {
        if (isCancelled) return;
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar profesionales.";
        setManualEligibleEmployees([]);
        setManualSelectedEmployeeId("");
        setManualErrorMessage(message);
        toast.error(message);
      } finally {
        if (!isCancelled) {
          setIsLoadingManualEmployees(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [manualSelectedServiceIds, token]);

  useEffect(() => {
    if (!token || !strictSelectedEmployeeId || strictSelectedServiceIds.length === 0 || !strictDate) {
      setStrictSlots([]);
      setStrictSelectedSlotStart(null);
      setStrictRequiredDurationMinutes(null);
      setStrictAvailabilityTimezone(null);
      return;
    }

    let isCancelled = false;
    setIsLoadingStrictSlots(true);
    setStrictErrorMessage("");
    setStrictSlots([]);
    setStrictRequiredDurationMinutes(null);
    setStrictAvailabilityTimezone(null);
    setStrictSelectedSlotStart(null);

    (async () => {
      try {
        const availability = await bookingsService.getAvailability(
          {
            employee_id: strictSelectedEmployeeId,
            service_ids: strictSelectedServiceIds,
            date: strictDate,
          },
          token,
        );
        if (isCancelled) return;
        setStrictSlots(availability.slots);
        setStrictRequiredDurationMinutes(availability.required_duration_minutes);
        setStrictAvailabilityTimezone(availability.timezone);
        setStrictSelectedSlotStart((prev) =>
          prev && availability.slots.some((slot) => slot.start_at_utc === prev) ? prev : null,
        );
      } catch (error) {
        if (isCancelled) return;
        const message =
          error instanceof Error ? error.message : "No se pudo calcular disponibilidad.";
        setStrictSlots([]);
        setStrictSelectedSlotStart(null);
        setStrictRequiredDurationMinutes(null);
        setStrictAvailabilityTimezone(null);
        setStrictErrorMessage(message);
        toast.error(message);
      } finally {
        if (!isCancelled) {
          setIsLoadingStrictSlots(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [strictDate, strictSelectedEmployeeId, strictSelectedServiceIds, token]);

  const resetStrictForm = useCallback(() => {
    setStrictSelectedServiceIds([]);
    setStrictEligibleEmployees([]);
    setStrictSelectedEmployeeId("");
    setStrictDate(getTodayDateInput());
    setStrictSlots([]);
    setStrictSelectedSlotStart(null);
    setStrictRequiredDurationMinutes(null);
    setStrictAvailabilityTimezone(null);
    setStrictCustomerForm(INITIAL_CUSTOMER_FORM);
    setStrictErrorMessage("");
  }, []);

  const resetManualForm = useCallback(() => {
    setManualSelectedServiceIds([]);
    setManualEligibleEmployees([]);
    setManualSelectedEmployeeId("");
    setManualDate(getTodayDateInput());
    setManualTime(getRoundedCurrentTime());
    setManualStatus("");
    setManualAllowOverlap(false);
    setManualCancellationReason("");
    setManualCustomerForm(INITIAL_CUSTOMER_FORM);
    setManualErrorMessage("");
  }, []);

  const handleStrictSubmit = async () => {
    if (!token || !strictSelectedSlotStart) return;

    if (
      strictCustomerForm.customer_email.trim().length > 0 &&
      !/^\S+@\S+\.\S+$/.test(strictCustomerForm.customer_email.trim())
    ) {
      setStrictErrorMessage("El correo del cliente no es válido.");
      return;
    }

    const phoneValidationError = validateOptionalPhoneValue({
      countryIso2: strictCustomerForm.customer_phone_country_iso2,
      nationalNumber: strictCustomerForm.customer_phone_national_number,
      label: "teléfono",
    });
    if (phoneValidationError) {
      setStrictErrorMessage(phoneValidationError);
      return;
    }

    setIsSubmittingStrict(true);
    setStrictErrorMessage("");
    try {
      await bookingsService.create(
        {
          employee_id: strictSelectedEmployeeId,
          service_ids: strictSelectedServiceIds,
          start_at_utc: strictSelectedSlotStart,
          customer_name: strictCustomerForm.customer_name.trim(),
          customer_email: strictCustomerForm.customer_email.trim() || undefined,
          customer_phone_country_iso2:
            strictCustomerForm.customer_phone_country_iso2.trim() || undefined,
          customer_phone_national_number:
            strictCustomerForm.customer_phone_national_number.trim() || undefined,
          notes: strictCustomerForm.notes.trim() || undefined,
          source: "ADMIN",
        },
        token,
      );
      toast.success("Cita creada correctamente.");
      resetStrictForm();
      await onBookingCreated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cita.";
      setStrictErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmittingStrict(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!token) return;

    if (
      manualCustomerForm.customer_email.trim().length > 0 &&
      !/^\S+@\S+\.\S+$/.test(manualCustomerForm.customer_email.trim())
    ) {
      setManualErrorMessage("El correo del cliente no es válido.");
      return;
    }

    const phoneValidationError = validateOptionalPhoneValue({
      countryIso2: manualCustomerForm.customer_phone_country_iso2,
      nationalNumber: manualCustomerForm.customer_phone_national_number,
      label: "teléfono",
    });
    if (phoneValidationError) {
      setManualErrorMessage(phoneValidationError);
      return;
    }

    if (isCancellationStatus(manualStatus) && manualCancellationReason.trim().length === 0) {
      setManualErrorMessage("Debes indicar un motivo para cancelar o marcar como no asistió.");
      return;
    }

    const startAtUtc = buildLocalDateTimeToIso(manualDate, manualTime);
    if (!startAtUtc) {
      setManualErrorMessage("Debes indicar una fecha y hora válidas.");
      return;
    }

    setIsSubmittingManual(true);
    setManualErrorMessage("");
    try {
      await bookingsService.createManual(
        {
          employee_id: manualSelectedEmployeeId,
          service_ids: manualSelectedServiceIds,
          start_at_utc: startAtUtc,
          customer_name: manualCustomerForm.customer_name.trim(),
          customer_email: manualCustomerForm.customer_email.trim() || undefined,
          customer_phone_country_iso2:
            manualCustomerForm.customer_phone_country_iso2.trim() || undefined,
          customer_phone_national_number:
            manualCustomerForm.customer_phone_national_number.trim() || undefined,
          notes: manualCustomerForm.notes.trim() || undefined,
          status: manualStatus || undefined,
          cancellation_reason: manualCancellationReason.trim() || undefined,
          allow_overlap: manualAllowOverlap,
        },
        token,
      );
      toast.success("Registro manual guardado correctamente.");
      resetManualForm();
      await onBookingCreated?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el registro manual.";
      setManualErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  if (isLoadingServices) {
    return <TableSkeleton />;
  }

  if (loadError) {
    return (
      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        <p className="text-sm text-danger">{loadError}</p>
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        <p className="text-sm text-muted">
          Crea al menos un servicio activo para empezar a registrar citas.
        </p>
      </div>
    );
  }

  const tabSwitcher = (
    <div className="inline-flex rounded-2xl border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => setActiveTab("availability")}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          activeTab === "availability"
            ? "bg-accent text-accent-text shadow-theme-accent-sm"
            : "text-fg-secondary"
        }`}
      >
        Con disponibilidad
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("manual")}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          activeTab === "manual"
            ? "bg-accent text-accent-text shadow-theme-accent-sm"
            : "text-fg-secondary"
        }`}
      >
        Manual
      </button>
    </div>
  );

  const introCard =
    variant === "modal" ? (
      <div className="rounded-[24px] border border-card-border bg-surface-panel px-4 py-4 shadow-theme-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-fg-strong">
              Elige cómo registrar la cita.
            </p>
            <p className="mt-1 text-xs text-muted">
              Usa disponibilidad real para agenda limpia o manual para walk-ins y carga histórica.
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            {tabSwitcher}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border-soft bg-surface px-3 py-2 text-xs text-fg-secondary">
              <Clock3 className="h-4 w-4 text-fg-icon" />
              Manual recomendado para walk-ins e historial pasado. La sobreescritura de agenda queda apagada por defecto.
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="rounded-[28px] border border-card-border bg-gradient-to-br from-surface-warm to-surface-soft p-5 shadow-theme-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-warning">
              <Sparkles className="h-3.5 w-3.5" />
              Nueva cita
            </div>
            <h3 className="mt-3 text-lg font-semibold text-fg-strong">
              Crea citas por disponibilidad o en modo manual
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Usa disponibilidad real para no salirte de agenda, o registro manual cuando el negocio necesite flexibilidad operativa.
            </p>
          </div>

          {tabSwitcher}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-xs text-fg-secondary">
          <Clock3 className="h-4 w-4 text-fg-icon" />
          Manual recomendado para walk-ins e historial pasado. La sobreescritura de agenda queda apagada por defecto.
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {introCard}

      {activeTab === "availability" ? (
        <BookingComposer
          services={activeServices}
          selectedServiceIds={strictSelectedServiceIds}
          onToggleService={(serviceId) => {
            setStrictSelectedServiceIds((prev) =>
              prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
            );
            setStrictSlots([]);
            setStrictRequiredDurationMinutes(null);
            setStrictAvailabilityTimezone(null);
            setStrictSelectedSlotStart(null);
          }}
          eligibleEmployees={strictEligibleEmployees}
          isLoadingEligibleEmployees={isLoadingStrictEmployees}
          selectedEmployeeId={strictSelectedEmployeeId}
          onSelectEmployee={(employeeId) => {
            setStrictSelectedEmployeeId(employeeId);
            setStrictSlots([]);
            setStrictRequiredDurationMinutes(null);
            setStrictAvailabilityTimezone(null);
            setStrictSelectedSlotStart(null);
          }}
          selectedDate={strictDate}
          onDateChange={(date) => {
            setStrictDate(date);
            setStrictSlots([]);
            setStrictRequiredDurationMinutes(null);
            setStrictAvailabilityTimezone(null);
            setStrictSelectedSlotStart(null);
          }}
          slots={strictSlots}
          isLoadingSlots={isLoadingStrictSlots}
          selectedSlotStart={strictSelectedSlotStart}
          onSelectSlot={setStrictSelectedSlotStart}
          requiredDurationMinutes={strictRequiredDurationMinutes}
          availabilityTimezone={strictAvailabilityTimezone}
          customerForm={strictCustomerForm}
          onCustomerFormChange={setStrictCustomerForm}
          onSubmit={() => void handleStrictSubmit()}
          isSubmitting={isSubmittingStrict}
          errorMessage={strictErrorMessage}
          isReadyToSubmit={
            strictSelectedServiceIds.length > 0 &&
            strictSelectedEmployeeId.length > 0 &&
            Boolean(strictSelectedSlotStart) &&
            strictCustomerForm.customer_name.trim().length > 0
          }
          wizardMode={variant === "modal"}
        />
      ) : (
        <ManualBookingComposer
          services={activeServices}
          selectedServiceIds={manualSelectedServiceIds}
          onToggleService={(serviceId) => {
            setManualSelectedServiceIds((prev) =>
              prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
            );
          }}
          eligibleEmployees={manualEligibleEmployees}
          isLoadingEligibleEmployees={isLoadingManualEmployees}
          selectedEmployeeId={manualSelectedEmployeeId}
          onSelectEmployee={setManualSelectedEmployeeId}
          manualDate={manualDate}
          onManualDateChange={setManualDate}
          manualTime={manualTime}
          onManualTimeChange={setManualTime}
          manualStatus={manualStatus}
          onManualStatusChange={setManualStatus}
          allowOverlap={manualAllowOverlap}
          onAllowOverlapChange={setManualAllowOverlap}
          cancellationReason={manualCancellationReason}
          onCancellationReasonChange={setManualCancellationReason}
          customerForm={manualCustomerForm}
          onCustomerFormChange={setManualCustomerForm}
          onSubmit={() => void handleManualSubmit()}
          isSubmitting={isSubmittingManual}
          errorMessage={manualErrorMessage}
          estimatedDurationMinutes={manualEstimatedDurationMinutes}
          estimatedTotalPrice={manualEstimatedTotal}
          wizardMode={variant === "modal"}
        />
      )}
    </div>
  );
}
