import { apiFetch } from "@/modules/http/services/api";
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee.types";

export const employeesService = {
  findAll: async (token: string): Promise<Employee[]> => {
    return apiFetch<Employee[]>("/employees", {
      method: "GET",
      token,
    });
  },

  create: async (payload: CreateEmployeePayload, token: string): Promise<Employee> => {
    return apiFetch<Employee>("/employees", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: UpdateEmployeePayload,
    token: string,
  ): Promise<Employee> => {
    return apiFetch<Employee>(`/employees/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
};
