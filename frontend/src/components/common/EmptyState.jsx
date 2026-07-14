import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No Data Available",
  description = "Data will appear here once your workspace becomes active.",
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-90 flex items-center justify-center">
      <div className="text-center max-w-sm px-8">

        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon
            size={30}
            className="text-slate-400"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-text-primary">
          {title}
        </h3>

        <p className="mt-2 text-sm text-text-secondary leading-6">
          {description}
        </p>

      </div>
    </div>
  );
}