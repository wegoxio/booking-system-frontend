export function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export function getAvatarTone(seed: string) {
    const tones = [
        "bg-amber-100 text-amber-700 ring-amber-200",
        "bg-sky-100 text-sky-700 ring-sky-200",
        "bg-emerald-100 text-emerald-700 ring-emerald-200",
        "bg-rose-100 text-rose-700 ring-rose-200",
        "bg-violet-100 text-violet-700 ring-violet-200",
    ];
    const index = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % tones.length;
    return tones[index];
}

export function formatPrice(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  return amount.toFixed(2);
}