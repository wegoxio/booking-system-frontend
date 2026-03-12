function SkeletonBlock({
    className,
}: {
    className: string;
}) {
    return <div className={`animate-pulse rounded-2xl bg-[#e8ebf2] ${className}`} />;
}

export function ServicesTableSkeleton() {
    return (
        <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5">
            <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                    <SkeletonBlock className="h-7 w-28" />
                    <SkeletonBlock className="h-4 w-48" />
                </div>
                <SkeletonBlock className="h-10 w-36" />
            </div>

            <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="grid animate-pulse gap-3 rounded-3xl border border-[#edf0f5] bg-white p-4 md:grid-cols-[1.5fr_0.8fr_1fr_1.3fr_0.8fr_1fr]"
                    >
                        <SkeletonBlock className="h-14 w-full" />
                        <SkeletonBlock className="h-14 w-full" />
                        <SkeletonBlock className="h-14 w-full" />
                        <SkeletonBlock className="h-14 w-full" />
                        <SkeletonBlock className="h-14 w-full" />
                        <SkeletonBlock className="h-14 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}