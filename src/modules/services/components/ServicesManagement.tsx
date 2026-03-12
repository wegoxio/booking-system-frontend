"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { employeesService } from "@/modules/employees/services/employees.service";
import { servicesService } from "@/modules/services/services/services.service";
import type { Employee } from "@/types/employee.types";
import type { Service, ServiceFormState } from "@/types/service.types";
import { validateServiceForm } from "@/utils/validation";
import { ServicesTableSkeleton } from "./ServicesTableSkeleton";
import { ServiceFormModal } from "./ServiceFormModal";
import { ServicesHeader } from "./ServicesHeader";
import { ServicesList } from "./ServicesList";
import {
  emptyServiceForm,
  serviceToFormState,
  toCreateServicePayload,
  toUpdateServicePayload,
} from "../utils/service-form.utils";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const LOAD_DELAY_MS = 1200;

export default function ServicesManagement() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(emptyServiceForm);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.is_active),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = employeeSearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeEmployees;
    }

    return activeEmployees.filter((employee) => {
      const haystack = `${employee.name} ${employee.email} ${employee.phone ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeEmployees, employeeSearch]);

  const selectedEmployees = useMemo(
    () => activeEmployees.filter((employee) => form.employee_ids.includes(employee.id)),
    [activeEmployees, form.employee_ids],
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [servicesData, employeesData] = await Promise.all([
        servicesService.findAll(token),
        employeesService.findAll(token),
      ]);
      await wait(LOAD_DELAY_MS);
      setServices(servicesData);
      setEmployees(employeesData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cargar informacion.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyServiceForm);
    setFormError("");
    setEmployeeSearch("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingId(service.id);
    setForm(serviceToFormState(service));
    setFormError("");
    setEmployeeSearch("");
    setIsModalOpen(true);
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setForm((prev) => {
      const selected = new Set(prev.employee_ids);
      if (selected.has(employeeId)) {
        selected.delete(employeeId);
      } else {
        selected.add(employeeId);
      }
      return { ...prev, employee_ids: Array.from(selected) };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validateServiceForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await servicesService.update(editingId, toUpdateServicePayload(form), token);
      } else {
        await servicesService.create(toCreateServicePayload(form), token);
      }
      await loadData();
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el servicio.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleServiceStatus = async (service: Service) => {
    if (!token) return;
    setIsTogglingId(service.id);
    try {
      await servicesService.toggleStatus(
        service.id,
        { is_active: !service.is_active },
        token,
      );
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cambiar el estado.";
      setErrorMessage(message);
    } finally {
      setIsTogglingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <ServicesHeader
        servicesCount={services.length}
        activeEmployeesCount={activeEmployees.length}
      />

      {isLoading ? (
        <ServicesTableSkeleton />
      ) : (
        <ServicesList
          services={services}
          errorMessage={errorMessage}
          isTogglingId={isTogglingId}
          onCreate={openCreateModal}
          onEdit={openEditModal}
          onToggleStatus={(service) => void handleToggleServiceStatus(service)}
        />
      )}

      <ServiceFormModal
        isOpen={isModalOpen}
        editingId={editingId}
        form={form}
        formError={formError}
        isSaving={isSaving}
        activeEmployees={activeEmployees}
        filteredEmployees={filteredEmployees}
        selectedEmployees={selectedEmployees}
        employeeSearch={employeeSearch}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={setForm}
        onEmployeeSearchChange={setEmployeeSearch}
        onEmployeeToggle={handleEmployeeToggle}
      />
    </section>
  );
}
