import { ServiceFormState } from "@/types/service.types";
import { TenantFormState } from "@/types/tenant.types";
import { normalizeSlug } from "./format";
import { TenantAdminFormState } from "@/types/tenant-admin.types";
import { EmployeeFormState } from "@/types/employee.types";
import { validateOptionalPhoneValue } from "@/modules/phone/utils/phone";

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

export function validateTenantCreateForm(form: TenantFormState): string | null {
    const normalizedName = form.name.trim();
    const normalizedSlug = normalizeSlug(form.slug);

    if (normalizedName.length < 1 || normalizedName.length > 120) {
        return "El nombre debe tener entre 1 y 120 caracteres.";
    }

    if (normalizedSlug.length < 3 || normalizedSlug.length > 60) {
        return "El slug debe tener entre 3 y 60 caracteres.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
        return "Slug invalido. Solo minusculas, numeros y guiones.";
    }

    return null;
}

export function validateTenantAdminCreateForm(form: TenantAdminFormState, isEditing: boolean): string | null {
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim();

    if (normalizedName.length < 1 || normalizedName.length > 120) {
        return "El nombre debe tener entre 1 y 120 caracteres.";
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return "Debes ingresar un correo valido.";
    }

    if (!form.tenant_id) {
        return "Debes asignar un tenant.";
    }

    return null;
}

export function validateEmployeeCreateForm(form: EmployeeFormState): string | null {
    const normalizedName = form.name.trim();
    const normalizedEmail = form.email.trim();

    if (normalizedName.length < 1 || normalizedName.length > 120) {
        return "El nombre debe tener entre 1 y 120 caracteres.";
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return "Debes ingresar un correo valido.";
    }

    const phoneValidationError = validateOptionalPhoneValue({
        countryIso2: form.phone_country_iso2,
        nationalNumber: form.phone_national_number,
        legacyDisplay: form.phone_legacy,
    });

    if (phoneValidationError) {
        return phoneValidationError;
    }

    return null;
}

export function isStrongPassword(value: string) {
    return (
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^A-Za-z0-9]/.test(value)
    );
}
