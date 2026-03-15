import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar as EmployeeAvatar } from "@/modules/employees/components/components/Avatar";

type EmployeeEditModalContentProps = {
  form: {
    name: string;
    email: string;
    phone: string;
    is_active: boolean;
  };
  isEditing: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
};

export default function EmployeeEditModalContent({
  form,
  isEditing,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onIsActiveChange,
}: EmployeeEditModalContentProps): React.ReactNode {
  return (
    <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="employee-name" className="text-sm font-medium text-fg-label">
            Nombre
          </label>
          <input
            id="employee-name"
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            placeholder="Ej: Ana Lopez"
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="employee-email" className="text-sm font-medium text-fg-label">
            Email
          </label>
          <input
            id="employee-email"
            type="email"
            value={form.email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            placeholder="empleado@empresa.com"
            required
            maxLength={255}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="employee-phone" className="text-sm font-medium text-fg-label">
            Telefono
          </label>
          <input
            id="employee-phone"
            value={form.phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            placeholder="+34 600 000 000"
            maxLength={30}
          />
        </div>

        {isEditing ? (
          <label className="flex items-center gap-2 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm text-fg-label">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => onIsActiveChange(event.target.checked)}
            />
            Employee activo
          </label>
        ) : null}
      </div>

      <div className="space-y-4 rounded-[28px] border border-border bg-inverse-80 p-5">
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={form.name || "Nuevo Employee"} />
          <div>
            <p className="font-semibold text-fg-strong">{form.name.trim() || "Nuevo Employee"}</p>
            <p className="text-sm text-muted">{form.email.trim() || "correo@empresa.com"}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-border-soft bg-surface-panel-strong p-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-fg">
              <Mail className="h-4 w-4 text-fg-icon" />
              Contacto principal
            </div>
            <p className="mt-2 text-sm text-muted">
              Usa un email real para notificaciones y asignaciones operativas.
            </p>
          </div>

          <div className="rounded-2xl border border-border-soft bg-surface-panel-strong p-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-fg">
              <Phone className="h-4 w-4 text-fg-icon" />
              Telefono de soporte
            </div>
            <p className="mt-2 text-sm text-muted">
              {form.phone.trim() || "Aun no se ha definido un telefono para este perfil."}
            </p>
          </div>

          <div className="rounded-2xl border border-border-soft bg-surface-panel-strong p-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-fg">
              <ShieldCheck className="h-4 w-4 text-fg-icon" />
              Estado del perfil
            </div>
            <p className="mt-2 text-sm text-muted">
              {isEditing
                ? form.is_active
                  ? "Este employee aparecera disponible para asignaciones."
                  : "Este employee quedara oculto de los flujos activos."
                : "El nuevo employee se creara como activo por defecto."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

