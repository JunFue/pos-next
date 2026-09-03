import { Printer, HelpCircle, Palette } from "lucide-react";
import { ShortcutsGuide } from "../ShortcutsGuide";

interface HeaderToolbarProps {
  onOpenThemeModal?: () => void;
}

export const HeaderToolbar = ({ onOpenThemeModal }: HeaderToolbarProps) => {
  return (
    <div className="mt-auto">
      <span className="block mb-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
        Tools
      </span>
      <div className="flex items-center gap-2">
        <ShortcutsGuide />
        <button
          type="button"
          onClick={onOpenThemeModal}
          className="group flex justify-center items-center bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/50 rounded-lg w-10 h-10 transition-all duration-300"
          title="Customize POS Theme (Alt + P)"
        >
          <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        <button
          type="button"
          className="flex justify-center items-center bg-muted/50 hover:bg-muted border border-border rounded-lg w-10 h-10 transition-colors"
          title="Reprint Last Receipt"
        >
          <Printer className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="flex justify-center items-center bg-muted/50 hover:bg-muted border border-border rounded-lg w-10 h-10 transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
