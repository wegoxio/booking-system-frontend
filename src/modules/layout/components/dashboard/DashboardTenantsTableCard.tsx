import { ChevronDown } from "lucide-react";
import Avatar from "@/modules/ui/Avatar";
import Card from "@/modules/ui/Card";
import StatusPill from "@/modules/ui/StatusPill";
import { tenantRows } from "./dashboard-mock-data";

export default function DashboardTenantsTableCard() {
  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[30px] font-semibold leading-none text-[#2b2f3a]">
          Tenants
        </h3>

        <div className="flex items-center gap-1 rounded-lg border border-[#e3e5ec] bg-[#f7f7f9] p-1 text-xs text-[#666a76]">
          <button className="rounded-md bg-white px-3 py-1">All</button>
          <button className="rounded-md px-3 py-1 hover:bg-white">Active</button>
          <button className="rounded-md px-3 py-1 hover:bg-white">Inactive</button>
          <button className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-white">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#ebecf0] bg-[#f8f8fa]">
        <table className="min-w-[760px] w-full text-left">
          <thead className="border-b border-[#ececf1] bg-[#f5f5f8]">
            <tr className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9397a4]">
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Bookings this month</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {tenantRows.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-[#ececf1] text-sm text-[#454a56] last:border-b-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold ${tenant.tenantColor}`}
                    >
                      {tenant.tenantBadge}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2d313b]">{tenant.tenantName}</p>
                      <p className="text-[10px] text-[#8f93a0]">{tenant.tenantDomain}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={tenant.adminName} />
                    <div>
                      <p className="font-medium text-[#2d313b]">{tenant.adminName}</p>
                      <p className="text-[10px] text-[#8f93a0]">{tenant.adminEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-base font-semibold text-[#2d313b]">
                    {tenant.users}
                  </span>{" "}
                  <span className="text-xs text-[#8f93a0]">Users</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-base font-semibold text-[#2d313b]">
                    {tenant.bookings}
                  </span>{" "}
                  <span className="text-xs text-[#8f93a0]">/ month</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusPill
                    label={tenant.status}
                    variant={tenant.status === "Active" ? "active" : "inactive"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
