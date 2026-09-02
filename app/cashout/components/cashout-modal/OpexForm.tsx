"use client";

import React from "react";
import {
  Lightbulb, Wifi, Coffee, Wrench, Store, Truck, Briefcase, ShieldCheck, User, DollarSign,
  Zap, Heart, Home, Package, Droplet, Flame, Car, Hammer, Scissors, Smartphone
} from "lucide-react";
import { CashoutInput } from "../../lib/cashout.api";
import { useClassifications } from "../../hooks/useClassifications";

// Shared icon map for OPEX categories
export const ICON_MAP: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb size={18} />,
  Wifi: <Wifi size={18} />,
  Coffee: <Coffee size={18} />,
  Wrench: <Wrench size={18} />,
  Store: <Store size={18} />,
  Truck: <Truck size={18} />,
  Briefcase: <Briefcase size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
  User: <User size={18} />,
  DollarSign: <DollarSign size={18} />,
  Zap: <Zap size={18} />,
  Heart: <Heart size={18} />,
  Home: <Home size={18} />,
  Package: <Package size={18} />,
  Droplet: <Droplet size={18} />,
  Flame: <Flame size={18} />,
  Car: <Car size={18} />,
  Hammer: <Hammer size={18} />,
  Scissors: <Scissors size={18} />,
  Smartphone: <Smartphone size={18} />,
};

interface OpexFormProps {
  data: Partial<CashoutInput>;
  onChange: (data: Partial<CashoutInput>) => void;
}

export const OpexForm = ({ data, onChange }: OpexFormProps) => {
  const { classifications, isLoading } = useClassifications();

  const handleSelect = (cls: any) => {
    onChange({
      ...data,
      classification_id: cls.id,
      expenseCategory: cls.name,
      icon: cls.icon || 'Store'
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-muted rounded-xl border border-border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Select Expense Category
        </label>
      </div>

      {classifications.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm font-medium text-foreground">No expense categories configured.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please ask your administrator to configure categories in the admin portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
          {classifications.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border duration-200 group ${
                data.classification_id === cat.id
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-1'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div
                className={`mb-2 p-2 rounded-full transition-colors ${
                  data.classification_id === cat.id ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/20'
                }`}
              >
                {ICON_MAP[cat.icon || 'Store'] || <Store size={20} />}
              </div>
              <span className="text-[10px] font-bold text-center uppercase tracking-tight leading-tight px-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
