import { Check, ChevronDown } from "lucide-react";
import Avatar from "@/modules/ui/Avatar";
import Card from "@/modules/ui/Card";
import { AuditLogItem } from "../mocks/dashboard-mock-data";

type RecentAuditLogsCardProps = {
  title: string;
  logs: AuditLogItem[];
  withRanges?: boolean;
  withViewAll?: boolean;
  compactSubtitle?: boolean;
};

export default function RecentAuditLogsCard({
  title,
  logs,
  withRanges = false,
  withViewAll = false,
  compactSubtitle = false,
}: RecentAuditLogsCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[30px] font-semibold leading-none text-[#2b2f3a]">
          {title}
        </h3>

        {withRanges ? (
          <div className="flex items-center gap-1 rounded-lg border border-[#e5e6eb] bg-[#f7f7f9] p-1 text-xs text-[#666a76]">
            <button className="rounded-md bg-white px-2 py-1">30d</button>
            <button className="rounded-md px-2 py-1 hover:bg-white">90d</button>
            <button className="rounded-md px-2 py-1 hover:bg-white">YTD</button>
            <button className="rounded-md px-2 py-1 hover:bg-white">1y</button>
            <button className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-white">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {withViewAll ? (
          <button className="inline-flex items-center gap-1 rounded-md border border-[#dfe1e7] bg-white px-3 py-1.5 text-xs text-[#616571]">
            View All
            <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
          </button>
        ) : null}
      </div>

      <ul className="space-y-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg py-1"
          >
            <Avatar name={log.actor} />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#2d313b]">
                {log.actor}
              </p>
              <p className="text-xs font-semibold text-[#d0932a]">{log.action}</p>
              {compactSubtitle && log.subtitle ? (
                <p className="truncate text-[10px] text-[#8f93a0]">{log.subtitle}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8e929e]">{log.time}</span>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
