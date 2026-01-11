"use client";

import { Keyboard, X, Command } from "lucide-react";
import { useState, useEffect } from "react";

export const ShortcutsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key if open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    { key: "Esc", label: "Clear Terminal / Cancel", icon: "⎋" },
    { key: "Alt + H", label: "Home / POS", icon: "⌘H" },
    { key: "Alt + D", label: "Dashboard", icon: "⌘D" },
    { key: "Alt + T", label: "Transactions History", icon: "⌘T" },
    { key: "Alt + I", label: "Inventory Management", icon: "⌘I" },
    { key: "Alt + C", label: "Customer Database", icon: "⌘C" },
    { key: "Alt + E", label: "Expenses", icon: "⌘E" },
    { key: "Alt + R", label: "Reports", icon: "⌘R" },
    { key: "Alt + S", label: "Settings", icon: "⌘S" },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex justify-center items-center bg-slate-800/50 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg w-10 h-10 transition-all duration-300"
        title="View Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
          <div className="relative bg-slate-900/90 shadow-2xl border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden glass-effect">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-slate-800/30 px-6 py-4 border-slate-700/50 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-2 rounded-lg">
                  <Command className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-lexend)] font-bold text-white text-lg tracking-wide">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Navigate the system quickly without using a mouse.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-red-500/10 p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts Grid */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 p-6">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                >
                  <span className="font-[family-name:var(--font-lexend)] font-medium text-slate-300 text-sm">
                    {shortcut.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Visual Keycap Style */}
                    <kbd className="hidden sm:inline-flex items-center gap-1 bg-slate-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)] px-2 border border-slate-700 rounded h-7 font-mono font-medium text-[10px] text-slate-300">
                      {shortcut.key}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-950/30 px-6 py-3 border-slate-800 border-t text-center">
              <p className="text-slate-500 text-xs">
                Press <span className="font-bold text-cyan-400">Esc</span> to
                close this window
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
