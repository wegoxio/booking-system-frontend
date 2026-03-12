import { Sparkles } from "lucide-react";

type ServicesHeaderProps = {
  servicesCount: number;
  activeEmployeesCount: number;
};

export function ServicesHeader({
  servicesCount,
  activeEmployeesCount,
}: ServicesHeaderProps) {
  return (
    <div className="rounded-[28px] border border-[#e4e4e8] bg-[linear-gradient(135deg,#fffdf7_0%,#f6f8fc_100%)] p-6 shadow-[0_18px_40px_rgba(22,31,57,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff6dd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9c6a00]">
            <Sparkles className="h-3.5 w-3.5" />
            Service Studio
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#202534]">
            Services
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-[#6f7380]">
            Crea y edita servicios del tenant. Cada servicio debe tener al menos un
            employee asignado.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
              Servicios
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#202534]">{servicesCount}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
              Employees activos
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#202534]">
              {activeEmployeesCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
