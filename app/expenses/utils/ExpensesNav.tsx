"use client";

import { Landmark, PieChart } from "lucide-react";

type View = "cashout" | "monitor";

type ExpensesNavProps = {
  currentView: View;
  setView: (view: View) => void;
};

export function ExpensesNav({ currentView, setView }: ExpensesNavProps) {
  const navButtons = [
    {
      id: "cashout",
      text: "Cashout",
      Icon: Landmark,
    },
    {
      id: "monitor",
      text: "Expenses Monitor",
      Icon: PieChart,
    },
  ];

  return (
    <nav className="gap-4 grid grid-cols-2 mb-8">
      {navButtons.map((button) => (
        <button
          key={button.id}
          // Using btn-3d-glass class from your globals.css
          className={`btn-3d-glass flex flex-col items-center justify-center p-4 text-center transition-all duration-200
            ${
              currentView === button.id
                ? "bg-white/20 text-white" // Active state
                : "text-slate-300 hover:text-white" // Inactive state
            }
          `}
          onClick={() => setView(button.id as View)}
        >
          <button.Icon className="mb-2 w-8 h-8" />
          <span className="font-medium text-sm">{button.text}</span>
        </button>
      ))}
    </nav>
  );
}
