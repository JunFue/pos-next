import Link from "next/link";
import React from "react";
import {
  Archive,
  ArrowLeftRight,
  BarChart,
  Brain,
  Inbox,
  LayoutGrid,
  Settings,
  StickyNote,
  TrendingDown,
  Users,
} from "lucide-react"; // 1. Import icons

const Navigation = () => {
  // 2. Add the 'Icon' component to your nav array
  const nav = [
    { id: "dashboard", text: "Dashboard", Icon: LayoutGrid },
    { id: "inventory", text: "Inventory", Icon: Archive },
    { id: "expenses", text: "Expenses", Icon: TrendingDown },
    { id: "transactions", text: "Transactions", Icon: ArrowLeftRight },
    { id: "settings", text: "Settings", Icon: Settings },
    { id: "reports", text: "Reports", Icon: BarChart },
    { id: "customers", text: "Customers", Icon: Users }, // Kept your spelling
    { id: "junfue-ai", text: "JunFue AI", Icon: Brain },
    { id: "inbox", text: "Inbox", Icon: Inbox },
    { id: "notes", text: "Notes", Icon: StickyNote },
  ];

  return (
    // 3. Use CSS Grid for the 5-column layout
    <nav className="gap-4 grid grid-cols-5 mb-8">
      {nav.map((item) => (
        <Link
          key={item.id} // 4. Key is now on the Link component
          href={`/${item.id}`}
          // 5. Style the Link as the clickable card
          className="flex flex-col justify-center items-center p-4 rounded-lg text-slate-300 hover:text-white text-center transition-all duration-200 glass-effect"
        >
          {/* Render the icon */}
          <item.Icon className="mb-2 w-8 h-8" />
          {/* Render the text */}
          <span className="font-medium text-xs">{item.text}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
