import { User, Scan } from "lucide-react";

interface ViewSwitcherProps {
  view: "manual" | "ai-scan";
  setView: (view: "manual" | "ai-scan") => void;
}

export const ViewSwitcher = ({ view, setView }: ViewSwitcherProps) => {
  return (
    <div className="flex bg-slate-950/50 mb-6 p-1 border border-slate-800 rounded-xl">
      <button
        type="button"
        onClick={() => setView("manual")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
          view === "manual"
            ? "bg-slate-800 text-white shadow-lg"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <User className="w-4 h-4" />
        Manual Input
      </button>
      <button
        type="button"
        onClick={() => setView("ai-scan")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
          view === "ai-scan"
            ? "bg-cyan-600 text-white shadow-lg"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Scan className="w-4 h-4" />
        AI Scan Auto Fill
      </button>
    </div>
  );
};
