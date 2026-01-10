"use client";

import { Calendar as CalendarIcon, Lock, Unlock, LogOut } from "lucide-react";
import dayjs from "dayjs";
import { useTransactionStore } from "./stores/useTransactionStore";
import { useStaffPermissions } from "./stores/useStaffPermissions";

export default function BackdateSettings() {
  const { customTransactionDate, setCustomTransactionDate } =
    useTransactionStore();
  const { canBackdate, isLoading } = useStaffPermissions();

  if (isLoading)
    return <div className="text-slate-500">Loading permissions...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`flex justify-center items-center rounded-lg w-10 h-10 ${
            canBackdate
              ? "bg-amber-500/10 text-amber-400"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">
            Transaction Date Override
          </h2>
          <p className="text-slate-400 text-sm">
            {canBackdate
              ? "You have permission to backdate sales."
              : "You do not have permission to backdate sales."}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 border border-slate-800 rounded-xl">
        {!canBackdate ? (
          <div className="flex items-center gap-3 text-slate-500">
            <Lock className="w-4 h-4" />
            <span>
              Date selection is locked. All transactions will be recorded at{" "}
              <strong>Live Time</strong>.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-amber-500/10 p-3 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
              <Unlock className="w-4 h-4" />
              <span>
                <strong>Active:</strong> Any new sale will use the date selected
                below.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-slate-300 text-sm">
                Effective Date for Next Sale
              </label>
              <div className="flex flex-wrap items-end gap-4">
                <input
                  type="datetime-local"
                  className="bg-slate-950 [&::-webkit-calendar-picker-indicator]:invert px-3 py-2 border border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-cyan-500 h-[42px] text-white [&::-webkit-calendar-picker-indicator]:filter"
                  value={
                    customTransactionDate
                      ? dayjs(customTransactionDate).format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    // Store as ISO string
                    const val = e.target.value;
                    const dateStr = val ? new Date(val).toISOString() : null;
                    setCustomTransactionDate(dateStr);
                  }}
                />

                {customTransactionDate && (
                  <button
                    onClick={() => setCustomTransactionDate(null)}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 border border-red-500/20 rounded-md h-[42px] text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    End Session
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
