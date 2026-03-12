import { getAvatarTone, getInitials } from "@/utils/format";

export function Avatar({
    name,
    size = "md",
}: {
    name: string;
    size?: "sm" | "md";
}) {
    const sizing = size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";

    return (
        <div
            className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ${sizing} ${getAvatarTone(
                name,
            )}`}
            aria-hidden="true"
        >
            {getInitials(name)}
        </div>
    );
}