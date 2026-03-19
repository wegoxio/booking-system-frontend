import SelectField, { type SelectOption } from "@/modules/ui/SelectField";
import type { Employee } from "@/types/employee.types";
import type { ServiceFormState } from "@/types/service.types";
import { ServiceEmployeesSelector } from "./ServiceEmployeesSelector";

type ServiceEditModalContentProps = {
  form: ServiceFormState;
  isEditing: boolean;
  activeEmployees: Employee[];
  filteredEmployees: Employee[];
  selectedEmployees: Employee[];
  employeeSearch: string;
  onFormChange: (updater: (prev: ServiceFormState) => ServiceFormState) => void;
  onEmployeeSearchChange: (value: string) => void;
  onEmployeeToggle: (employeeId: string) => void;
};

const BASE_DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
const BASE_CAPACITY_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);
const BASE_CURRENCY_OPTIONS = ["USD", "EUR", "DOP", "MXN", "COP"];

function buildNumberOptions(
  baseValues: number[],
  currentValue: number,
  labelFormatter: (value: number) => string,
): SelectOption[] {
  const values = new Set(baseValues);
  values.add(currentValue);

  return Array.from(values)
    .sort((a, b) => a - b)
    .map((value) => ({
      value: String(value),
      label: labelFormatter(value),
    }));
}

function buildCurrencyOptions(currentValue: string): SelectOption[] {
  const values = new Set(BASE_CURRENCY_OPTIONS);
  const normalizedCurrent = currentValue.trim().toUpperCase();
  if (normalizedCurrent) {
    values.add(normalizedCurrent);
  }

  return Array.from(values)
    .sort()
    .map((currency) => ({
      value: currency,
      label: currency,
    }));
}

export default function ServiceEditModalContent({
  form,
  isEditing,
  activeEmployees,
  filteredEmployees,
  selectedEmployees,
  employeeSearch,
  onFormChange,
  onEmployeeSearchChange,
  onEmployeeToggle,
}: ServiceEditModalContentProps): React.ReactNode {
  const durationOptions = buildNumberOptions(
    BASE_DURATION_OPTIONS,
    form.duration_minutes,
    (value) => `${value} min`,
  );
  const capacityOptions = buildNumberOptions(
    BASE_CAPACITY_OPTIONS,
    form.capacity,
    (value) => `${value} persona${value === 1 ? "" : "s"}`,
  );
  const currencyOptions = buildCurrencyOptions(form.currency);

  return (
    <div className="space-y-4">
      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-1.5">
          <label htmlFor="service-name" className="text-sm font-medium text-fg-label">
            Nombre
          </label>
          <input
            id="service-name"
            value={form.name}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, name: event.target.value }))
            }
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            placeholder="Ej: Corte + Barba"
            required
          />
        </div>

        <ServiceEmployeesSelector
          employees={activeEmployees}
          filteredEmployees={filteredEmployees}
          selectedEmployees={selectedEmployees}
          selectedIds={form.employee_ids}
          employeeSearch={employeeSearch}
          onEmployeeSearchChange={onEmployeeSearchChange}
          onEmployeeToggle={onEmployeeToggle}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="service-duration" className="text-sm font-medium text-fg-label">
            Duracion (min)
          </label>
          <SelectField
            value={String(form.duration_minutes)}
            onValueChange={(value) =>
              onFormChange((prev) => ({
                ...prev,
                duration_minutes: Number(value),
              }))
            }
            options={durationOptions}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="service-capacity" className="text-sm font-medium text-fg-label">
            Capacidad
          </label>
          <SelectField
            value={String(form.capacity)}
            onValueChange={(value) =>
              onFormChange((prev) => ({ ...prev, capacity: Number(value) }))
            }
            options={capacityOptions}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="service-price" className="text-sm font-medium text-fg-label">
            Precio
          </label>
          <input
            id="service-price"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, price: Number(event.target.value) }))
            }
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="service-currency" className="text-sm font-medium text-fg-label">
            Moneda
          </label>
          <SelectField
            value={form.currency.trim().toUpperCase()}
            onValueChange={(value) =>
              onFormChange((prev) => ({ ...prev, currency: value.toUpperCase() }))
            }
            options={currencyOptions}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="service-description" className="text-sm font-medium text-fg-label">
          Descripcion
        </label>
        <textarea
          id="service-description"
          value={form.description}
          onChange={(event) =>
            onFormChange((prev) => ({ ...prev, description: event.target.value }))
          }
          className="min-h-28 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
          placeholder="Describe el valor del servicio, detalles o notas internas"
          maxLength={1000}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="service-instructions" className="text-sm font-medium text-fg-label">
          Instrucciones previas
        </label>
        <textarea
          id="service-instructions"
          value={form.instructions}
          onChange={(event) =>
            onFormChange((prev) => ({ ...prev, instructions: event.target.value }))
          }
          className="min-h-24 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
          placeholder="Ej: llegar con 10 minutos de antelacion, traer referencia, evitar lavado previo..."
          maxLength={2000}
        />
        <p className="text-xs text-muted">
          Campo opcional. Se mostrara en el flujo de reserva y tambien se enviara por correo.
        </p>
      </div>

      {isEditing ? (
        <label className="flex items-center gap-2 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm text-fg-label">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, is_active: event.target.checked }))
            }
          />
          Service activo
        </label>
      ) : null}
    </div>
  );
}

