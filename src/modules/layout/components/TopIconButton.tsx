export default function TopIconButton({
    children,
    ariaLabel,
}: {
    children: React.ReactNode;
    ariaLabel: string;
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            className="grid h-7 w-7 place-items-center rounded-full border border-icon-button-border bg-icon-button text-icon-button-text transition-colors hover:bg-icon-button-hover"
        >
            {children}
        </button>
    );
}