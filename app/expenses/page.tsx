"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExpensesNav } from "./utils/ExpensesNav";
import { Cashout } from "./components/Cashout";
import { ExpensesMntr } from "./components/ExpensesMntr";

type View = "cashout" | "monitor";

export default function ExpensesPage() {
  const [view, setView] = useState<View>("cashout");

  return (
    <div className="p-6 text-white">
      {/* --- Back Button --- */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="mb-4 font-bold text-2xl">Expenses Management</h1>
      {/* HEADER BORDER */}
      <div className="mb-8 border border-slate-700"></div>

      {/* --- Navigation --- */}
      <ExpensesNav currentView={view} setView={setView} />

      {/* --- Conditional Content --- */}
      <div>
        {view === "cashout" && <Cashout />}
        {view === "monitor" && <ExpensesMntr />}
      </div>
    </div>
  );
}
