import { ServiceFormState } from "@/types/service.types";

export function validateServiceForm(form: ServiceFormState): string | null {
    const normalizedName = form.name.trim();
    const normalizedCurrency = form.currency.trim().toUpperCase();

    if (normalizedName.length < 1 || normalizedName.length > 120) {
        return "El nombre debe tener entre 1 y 120 caracteres.";
    }
    if (!Number.isInteger(form.duration_minutes) || form.duration_minutes <= 0) {
        return "La duracion debe ser un entero positivo.";
    }
    if (!Number.isInteger(form.capacity) || form.capacity <= 0) {
        return "La capacidad debe ser un entero positivo.";
    }
    if (!Number.isFinite(form.price) || form.price < 0) {
        return "El precio debe ser mayor o igual a 0.";
    }
    if (normalizedCurrency.length !== 3) {
        return "La moneda debe tener 3 caracteres (ej. USD, EUR).";
    }
    if (form.employee_ids.length === 0) {
        return "Debes asignar al menos 1 employee al servicio.";
    }
    return null;
}