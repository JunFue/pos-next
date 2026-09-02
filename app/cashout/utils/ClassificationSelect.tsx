"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Classification } from "../lib/cashout.api";
import { useClassifications } from "@/app/cashout/hooks/useClassifications";

interface ClassificationSelectProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: string; // This will now receive the UUID
  onChange: (value: string) => void; // We will emit the UUID
  error?: string;
}

export const ClassificationSelect = forwardRef<
  HTMLInputElement,
  ClassificationSelectProps
>(
  (
    {
      value, // The ID (UUID)
      onChange,
      error,
      disabled,
      onKeyDown,
      onBlur,
      name,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Store state
    const {
      classifications,
      isLoading: loading,
    } = useClassifications();

    // UI state
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    
    // We track if the user is actively typing to avoid overwriting their text with the DB name
    const isTyping = useRef(false);

    // Keyboard navigation
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);

    // --- EFFECT 1: Sync External ID (value) -> Internal Text (search) ---
    useEffect(() => {
      // If we have a valid ID selected...
      if (value) {
        const match = classifications.find((c) => c.id === value);
        if (match) {
          // ...and we are not currently typing, update the display text to match the DB Name
          setSearch(match.name);
          isTyping.current = false;
        }
      } else if (!value && !isTyping.current) {
        // If ID is cleared externally (e.g. form reset), clear text
        setSearch("");
      }
    }, [value, classifications]);

    // --- EFFECT 2: Auto-Select ID based on Text (Smart Match) ---
    useEffect(() => {
        // If no ID is selected, but we have text (e.g. after creating "New Cat"),
        // try to find a matching name in the new list and auto-select its ID.
        if (!value && search.trim()) {
            const exactMatch = classifications.find(
                (c) => c.name.toLowerCase() === search.toLowerCase().trim()
            );
            if (exactMatch) {
                onChange(exactMatch.id);
                isTyping.current = false;
            }
        }
    }, [search, value, classifications, onChange]);


    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setHighlightIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Derived list
    const filtered = classifications.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );
    const exactMatch = filtered.some(
      (c) => c.name.toLowerCase() === search.toLowerCase().trim()
    );

    // Selection Handler
    const handleSelect = (cls: Classification) => {
      isTyping.current = false;
      setSearch(cls.name);
      onChange(cls.id); // <--- Sending ID, not Name
      setIsOpen(false);
      setHighlightIndex(-1);
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Input */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            name={name}
            value={search} // Controlled by 'search' (Name), not 'value' (ID)
            onBlur={(e) => {
              // On blur, if we have an exact match typed out, enforce selection
              const match = classifications.find(c => c.name.toLowerCase() === search.toLowerCase().trim());
              if (match && value !== match.id) {
                handleSelect(match);
              }
              if (onBlur) onBlur(e);
            }}
            onChange={(e) => {
              const next = e.target.value;
              isTyping.current = true;
              setSearch(next);
              
              if (value) onChange(""); 
              
              if (!isOpen) setIsOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => {
              setIsOpen(true);
              if (value) {
                const idx = filtered.findIndex((c) => c.id === value);
                setHighlightIndex(idx >= 0 ? idx : -1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
                setHighlightIndex((prev) =>
                  prev < filtered.length - 1 ? prev + 1 : filtered.length > 0 ? 0 : -1
                );
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((prev) =>
                  prev > 0 ? prev - 1 : filtered.length > 0 ? filtered.length - 1 : -1
                );
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (highlightIndex >= 0 && filtered[highlightIndex]) {
                  handleSelect(filtered[highlightIndex]);
                  if (onKeyDown) onKeyDown(e);
                }
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                setHighlightIndex(-1);
                return;
              }
              if (onKeyDown) onKeyDown(e);
            }}
            disabled={disabled}
            placeholder={placeholder || "Select classification..."}
            className={`w-full border-input rounded-xl p-2.5 text-sm focus:ring-ring focus:border-ring border bg-muted/20 focus:bg-card text-foreground transition-colors placeholder-muted-foreground/50 ${
              error ? "border-red-500" : ""
            }`}
            autoComplete="off"
            {...props}
          />

          <button
            type="button"
            className="top-1/2 right-3 absolute text-muted-foreground -translate-y-1/2"
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              if (!next) setHighlightIndex(-1);
            }}
            tabIndex={-1}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="z-50 absolute bg-card shadow-xl mt-1 border border-border rounded-lg w-full max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
            {filtered.map((cls, idx) => (
              <div
                key={cls.id}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm ${
                  idx === highlightIndex
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseLeave={() => setHighlightIndex(-1)}
                onClick={() => handleSelect(cls)}
              >
                <span className={value === cls.id ? "font-bold text-primary" : ""}>
                  {cls.name}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-4 text-muted-foreground text-xs text-center">
                {search.trim() === "" ? "No categories available" : `No category matching "${search}"`}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ClassificationSelect.displayName = "ClassificationSelect";