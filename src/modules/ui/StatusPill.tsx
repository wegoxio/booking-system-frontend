type StatusPillVariant = "active" | "inactive";

type StatusPillProps = {
  label: string;
  variant: StatusPillVariant;
};

const STYLES: Record<StatusPillVariant, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
};

export default function StatusPill({ label, variant }: StatusPillProps) {
  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${STYLES[variant]}`}
    >
      {label}
    </span>
  );
}
