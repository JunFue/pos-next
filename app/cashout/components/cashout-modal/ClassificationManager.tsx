
"use client";

import React from "react";
import { X, ShieldAlert } from "lucide-react";

interface ClassificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassificationManager = ({ isOpen, onClose }: ClassificationManagerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="text-primary" size={20} />
            Admin Managed
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="py-6 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Expense Categories are managed centrally by the Admin.
          </p>
          <p className="text-xs text-muted-foreground">
            To create, edit, or remove expense categories, please use the JunLink Admin portal settings.
          </p>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
