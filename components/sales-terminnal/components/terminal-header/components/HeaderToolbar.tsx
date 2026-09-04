import { Printer, HelpCircle, Palette, Maximize, Minimize, Tablet, Monitor } from "lucide-react";
import { ShortcutsGuide } from "../ShortcutsGuide";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";

interface HeaderToolbarProps {
  onOpenThemeModal?: () => void;
}

export const HeaderToolbar = ({ onOpenThemeModal }: HeaderToolbarProps) => {
  const { isFullscreen, toggleFullscreen, posMode, setPosMode } = useViewStore();
  const isTablet = posMode === "tablet";

  return (
    <div className="mt-auto">
      <span className="block mb-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
        Tools
      </span>
      <div className="flex items-center gap-2">
        <ShortcutsGuide />
        <button
          type="button"
          onClick={() => setPosMode(isTablet ? "desktop" : "tablet")}
          className={`group flex justify-center items-center rounded-lg w-10 h-10 transition-all duration-300 border ${
            isTablet
              ? "bg-primary/20 border-primary text-primary shadow-sm"
              : "bg-muted/50 hover:bg-primary/10 border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
          }`}
          title={isTablet ? "Switch to Desktop Mode (Alt + M)" : "Switch to Tablet Touch Mode (Alt + M)"}
        >
          {isTablet ? <Monitor className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`group flex justify-center items-center rounded-lg w-10 h-10 transition-all duration-300 border ${
            isFullscreen
              ? "bg-primary/20 border-primary text-primary shadow-sm"
              : "bg-muted/50 hover:bg-primary/10 border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
          }`}
          title={isFullscreen ? "Exit Fullscreen (Tab / Alt + F)" : "Enter Fullscreen (Tab / Alt + F)"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
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
