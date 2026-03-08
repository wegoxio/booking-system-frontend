type AvatarProps = {
  name: string;
  className?: string;
};

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-slate-200 text-slate-700",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function Avatar({ name, className = "" }: AvatarProps) {
  const colorIndex = name.charCodeAt(0) % AVATAR_COLORS.length;
  const colorClass = AVATAR_COLORS[colorIndex];

  return (
    <div
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${colorClass} ${className}`.trim()}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
