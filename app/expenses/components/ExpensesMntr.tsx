import { Megaphone, Wrench, Lightbulb, ChefHat } from "lucide-react";

// Mock data for monitor cards
const sources = [
  {
    name: "Operations",
    amount: "12,450.00",
    Icon: Wrench,
  },
  {
    name: "Marketing",
    amount: "8,200.00",
    Icon: Megaphone,
  },
  {
    name: "Utilities",
    amount: "2,100.50",
    Icon: Lightbulb,
  },
  {
    name: "Cost of Goods Sold",
    amount: "25,800.00",
    Icon: ChefHat,
  },
];

export function ExpensesMntr() {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {sources.map((source) => (
        <div key={source.name} className="p-6 glass-effect">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span className="font-medium text-sm">{source.name}</span>
            <source.Icon className="w-5 h-5" />
          </div>
          <p className="font-bold text-white text-3xl">${source.amount}</p>
          <p className="mt-1 text-red-400 text-xs">Total cashout this month</p>
        </div>
      ))}
    </div>
  );
}
