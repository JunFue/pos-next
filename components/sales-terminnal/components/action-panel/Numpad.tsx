import React, { useState } from "react";
import { Delete, Keyboard, Calculator } from "lucide-react";

interface NumpadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  isTabletMode?: boolean; // [NEW]
}

const KEYPAD_NUMBERS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];
const T9_KEYS = [
  { key: "1", sub: "" },
  { key: "2", sub: "ABC" },
  { key: "3", sub: "DEF" },
  { key: "4", sub: "GHI" },
  { key: "5", sub: "JKL" },
  { key: "6", sub: "MNO" },
  { key: "7", sub: "PQRS" },
  { key: "8", sub: "TUV" },
  { key: "9", sub: "WXYZ" },
  { key: ".", sub: "" },
  { key: "0", sub: "_" },
  { key: "⌫", sub: "" }
];

const QWERTY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

export const Numpad = ({ onKeyPress, onClear, isTabletMode }: NumpadProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);

  return (
    <div className="flex flex-col gap-2 h-full">
      {!isTabletMode && (
        <div className="flex items-center justify-between shrink-0 h-6">
          <span className="text-xs text-slate-400 font-bold">
            {showKeyboard ? "T9 Keypad" : "Numpad"}
          </span>
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="p-1 rounded bg-muted border border-border text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={showKeyboard ? "Show Numpad" : "Show T9 Keypad"}
          >
            {showKeyboard ? <Calculator className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
          </button>
        </div>
      )}

      {isTabletMode ? (
        <div className="flex flex-col gap-1.5 flex-1 justify-center max-w-full">
          {QWERTY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className={`flex justify-center gap-1 sm:gap-1.5 ${rowIndex === 2 ? "px-4" : rowIndex === 3 ? "px-6" : ""}`}>
              {row.map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className="flex-1 max-w-12 min-w-8 min-h-[40px] sm:min-h-[48px] bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-sm sm:text-base rounded shadow-sm border active:scale-95 flex items-center justify-center transition-all"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
          {/* Action Row */}
          <div className="flex justify-center gap-1.5 mt-1 px-1">
            <button
              type="button"
              onClick={onClear}
              className="flex-[0.5] min-w-12 min-h-[40px] sm:min-h-[48px] bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs sm:text-sm rounded shadow-sm border border-red-500/30 active:scale-95 transition-all flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onKeyPress(" ")}
              className="flex-2 min-h-[40px] sm:min-h-[48px] bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-base sm:text-lg rounded shadow-sm border active:scale-95 transition-all flex items-center justify-center"
            >
              Space
            </button>
            <button
              type="button"
              onClick={() => onKeyPress("Backspace")}
              className="flex-[0.5] min-w-12 min-h-[40px] sm:min-h-[48px] bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-base sm:text-xl rounded shadow-sm border active:scale-95 transition-all flex items-center justify-center"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => onKeyPress("Enter")}
              className="flex-1 min-w-16 min-h-[40px] sm:min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base rounded shadow-sm border border-primary/20 active:scale-95 transition-all flex items-center justify-center"
            >
              Enter
            </button>
          </div>
        </div>
      ) : showKeyboard ? (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {T9_KEYS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => item.key === "⌫" ? onClear() : onKeyPress(item.key)}
              className={`
                ${item.key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted hover:bg-muted/80 text-foreground border-border"}
                font-bold text-lg sm:text-xl rounded-lg shadow-sm border active:scale-95 transition-all flex flex-col items-center justify-center min-h-[44px]
              `}
            >
              <span>{item.key}</span>
              {item.sub && <span className="text-[10px] text-muted-foreground/70 font-normal leading-none">{item.sub}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {KEYPAD_NUMBERS.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => key === "⌫" ? onClear() : onKeyPress(key)}
              className={`
                ${key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted hover:bg-muted/80 text-foreground border-border"}
                font-bold text-lg sm:text-xl rounded-lg shadow-sm border active:scale-95 transition-all flex items-center justify-center min-h-[44px]
              `}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
