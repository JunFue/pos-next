import { Printer, HelpCircle } from "lucide-react";
import { ShortcutsGuide } from "../ShortcutsGuide";

export const HeaderToolbar = () => {
  return (
    <div className="mt-auto">
      <span className="block mb-2 font-bold text-[10px] text-slate-500 uppercase tracking-widest">
        Tools
      </span>
      <div className="flex items-center gap-2">
        <ShortcutsGuide />
        <button
          className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
          title="Reprint Last Receipt"
        >
          <Printer className="w-4 h-4 text-slate-400" />
        </button>
        <button
          className="flex justify-center items-center bg-slate-800/30 hover:bg-slate-700 border border-slate-700/50 rounded-lg w-10 h-10 transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
