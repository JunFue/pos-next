"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2
} from "lucide-react";
import {
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
  Classification
} from "../lib/expenses.api";

// Accept standard input props but override onChange/value to use controlled string API
interface ClassificationSelectProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ClassificationSelect = forwardRef<HTMLInputElement, ClassificationSelectProps>(
  (
    {
      value,
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
    // Data state
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [loading, setLoading] = useState(false);

    // UI state
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Keyboard navigation
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);

    // Load classifications
    const loadClassifications = async () => {
      try {
        setLoading(true);
        const data = await fetchClassifications();
        setClassifications(data);
      } catch (err) {
        console.error("Failed to load classifications", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadClassifications();

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setEditingId(null);
          setHighlightIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keep internal search in sync with external value
    useEffect(() => {
      setSearch(value || "");
    }, [value]);

    // Derived list
    const filtered = classifications.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );
    const exactMatch = filtered.some(
      (c) => c.name.toLowerCase() === search.toLowerCase().trim()
    );

    // Selection
    const handleSelect = (classificationName: string) => {
      onChange(classificationName);
      setSearch(classificationName);
      setIsOpen(false);
      setHighlightIndex(-1);
    };

    // Create
    const handleCreate = async () => {
      const trimmed = search.trim();
      if (!trimmed) return;
      try {
        setActionLoading(true);
        await createClassification(trimmed);
        await loadClassifications();
        onChange(trimmed);
        setSearch(trimmed);
        setIsOpen(false);
        setHighlightIndex(-1);
      } catch {
        alert("Failed to create classification");
      } finally {
        setActionLoading(false);
      }
    };

    // Edit
    const startEdit = (e: React.MouseEvent, cls: Classification) => {
      e.stopPropagation();
      setEditingId(cls.id);
      setEditValue(cls.name);
    };

    const saveEdit = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!editingId || !editValue.trim()) return;
      try {
        setActionLoading(true);
        await updateClassification(editingId, editValue);
        await loadClassifications();
        setEditingId(null);
        const original = classifications.find((c) => c.id === editingId)?.name;
        if (original && value === original) {
          onChange(editValue);
        }
      } catch {
        alert("Failed to update classification");
      } finally {
        setActionLoading(false);
      }
    };

    // Delete
    const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure? This cannot be undone.")) return;
      try {
        setActionLoading(true);
        await deleteClassification(id);
        await loadClassifications();
        const deletedName = classifications.find((c) => c.id === id)?.name;
        if (deletedName && value === deletedName) {
          onChange("");
          setSearch("");
        }
      } catch {
        alert("Failed to delete classification");
      } finally {
        setActionLoading(false);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Input */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            name={name}
            onBlur={onBlur}
            value={search}
            onChange={(e) => {
              const next = e.target.value;
              setSearch(next);
              onChange(next);
              if (!isOpen) setIsOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => {
              setIsOpen(true);
              // If we already have a value, put highlight on it if present
              if (value) {
                const idx = filtered.findIndex((c) => c.name === value);
                setHighlightIndex(idx >= 0 ? idx : -1);
              }
            }}
            onKeyDown={(e) => {
              // Local keyboard navigation
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

              if (e.key === "Enter" && highlightIndex >= 0 && filtered[highlightIndex]) {
                e.preventDefault();
                handleSelect(filtered[highlightIndex].name);
                return;
              }

              if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                setHighlightIndex(-1);
                return;
              }

              // Preserve external handler (e.g., parent navigation)
              if (onKeyDown) onKeyDown(e);
            }}
            disabled={disabled}
            placeholder={placeholder || "Select or create classification..."}
            className={`w-full input-dark pr-10 ${error ? "border-red-500" : ""}`}
            autoComplete="off"
            {...props}
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
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
          <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
            {filtered.map((cls, idx) => (
              <div
                key={cls.id}
                className={`group flex items-center justify-between px-3 py-2 cursor-pointer text-sm ${
                  idx === highlightIndex
                    ? "bg-slate-700 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseLeave={() => setHighlightIndex(-1)}
                onClick={() => handleSelect(cls.name)}
              >
                {editingId === cls.id ? (
                  <div
                    className="flex items-center gap-2 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs w-full text-white focus:outline-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      disabled={actionLoading}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={value === cls.name ? "font-bold" : ""}>
                      {cls.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(e, cls)}
                        className="p-1 hover:bg-slate-700 rounded text-blue-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, cls.id)}
                        className="p-1 hover:bg-slate-700 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!exactMatch && search.trim() !== "" && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={actionLoading}
                className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-800 border-t border-slate-800 flex items-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create "{search}"
              </button>
            )}

            {filtered.length === 0 && search.trim() === "" && (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                Start typing to add...
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ClassificationSelect.displayName = "ClassificationSelect";
