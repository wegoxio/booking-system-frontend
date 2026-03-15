"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmployeeEditModalContent from "@/modules/employees/components/EmployeeEditModalContent";
import EmployeesTable from "@/modules/employees/components/EmployeesTable";
import EmployeeScheduleModal from "@/modules/employees/components/EmployeeScheduleModal";
import { employeesService } from "@/modules/employees/services/employees.service";
import SectionHeader from "@/modules/ui/SectionHeader";
import TableEditModal from "@/modules/ui/TableEditModal";
import TableHeader from "@/modules/ui/TableHeader";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeFormState,
  UpdateEmployeePayload,
} from "@/types/employee.types";
import { wait } from "@/utils/delay";
import { validateEmployeeCreateForm } from "@/utils/validation";
import { toast } from "react-hot-toast";

const emptyForm: EmployeeFormState = {
  name: "",
  email: "",
  phone: "",
  is_active: true,
};

export default function EmployeesManagement() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleEmployeeId, setSelectedScheduleEmployeeId] = useState("");

  const activeEmployeesCount = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.email} ${employee.phone ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [employees, searchQuery]);

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await employeesService.findAll(token);
      await wait(600);
      setEmployees(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar employees.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? "",
      is_active: employee.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openScheduleModal = (employee: Employee) => {
    setSelectedScheduleEmployeeId(employee.id);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) return;

    const validationError = validateEmployeeCreateForm(form);
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }

    const basePayload: CreateEmployeePayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
    };

    setIsSaving(true);
    setFormError("");

    try {
      if (editingId) {
        const payload: UpdateEmployeePayload = {
          ...basePayload,
          is_active: form.is_active,
        };
        await employeesService.update(editingId, payload, token);
        toast.success("Employee actualizado correctamente.");
      } else {
        await employeesService.create(basePayload, token);
        toast.success("Employee creado correctamente.");
      }

      await loadEmployees();
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar employee.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const employeesStats = [
    {
      label: "Employees",
      value: employees.length,
    },
    {
      label: "Activos",
      value: activeEmployeesCount,
    },
  ];

  return (
    <section className="space-y-4">
      <SectionHeader
        headerTitle="Employees"
        headerDescription="Gestiona el personal que atiende servicios y mantiene operativa la agenda."
        stats={employeesStats}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
          <TableHeader
            title="Listado"
            subtitle="Vista del equipo, disponibilidad y datos de contacto."
            inputStateValue={searchQuery}
            inputOnchange={setSearchQuery}
            buttonOnOpen={openCreateModal}
            buttonLabel="Crear employee"
            searchPlaceholder="Buscar por nombre, email o telefono"
          />

          {errorMessage ? (
            <p className="mt-4 text-sm text-danger">{errorMessage}</p>
          ) : filteredEmployees.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
              <p className="text-base font-medium text-fg">
                {employees.length === 0
                  ? "No hay employees registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-muted">
                {employees.length === 0
                  ? "Crea el primero para comenzar a asignar servicios."
                  : "Prueba otro termino o limpia el filtro actual."}
              </p>
            </div>
          ) : (
            <EmployeesTable
              employees={filteredEmployees}
              onEdit={openEditModal}
              onOpenSchedule={openScheduleModal}
            />
          )}
        </div>
      )}

      <TableEditModal
        isOpen={isModalOpen}
        badgeLabel={editingId ? "Edit Employee" : "New Employee"}
        badgeIcon={<UserRound className="h-3.5 w-3.5" />}
        title={editingId ? "Editar employee" : "Crear employee"}
        description="Mantiene actualizada la informacion del equipo desde un flujo simple."
        helperText="Esta accion editara la informacion del usuario permanentemente."
        errorMessage={formError}
        submitText={isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear employee"}
        isSubmitting={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      >
        <EmployeeEditModalContent
          form={form}
          isEditing={!!editingId}
          onNameChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          onEmailChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          onPhoneChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
          onIsActiveChange={(value) => setForm((prev) => ({ ...prev, is_active: value }))}
        />
      </TableEditModal>

      <EmployeeScheduleModal
        isOpen={isScheduleModalOpen}
        token={token}
        employees={employees}
        selectedEmployeeId={selectedScheduleEmployeeId}
        onSelectEmployee={setSelectedScheduleEmployeeId}
        onClose={closeScheduleModal}
      />
    </section>
  );
}
