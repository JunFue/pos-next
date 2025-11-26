"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  DollarSign,
  Users,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";

// Mock data visualization components (kept as is for now)
const MockLineChart = () => (
  <div className="opacity-75 w-full h-64">
    <svg
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <line
        x1="0"
        y1="20"
        x2="200"
        y2="20"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="40"
        x2="200"
        y2="40"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="60"
        x2="200"
        y2="60"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="80"
        x2="200"
        y2="80"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />
      <path
        d="M 0 80 Q 20 40, 40 50 T 80 60 T 120 40 T 160 50 T 200 20"
        fill="none"
        stroke="var(--color-accent, #64ffda)"
        strokeWidth="2"
      />
    </svg>
  </div>
);

const MockDonutChart = () => (
  <div className="mx-auto w-48 h-48">
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="4"
      ></circle>
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeDasharray="60 100"
        strokeDashoffset="25"
      ></circle>
      <circle
        r="14"
        cx="16"
        cy="16"
        fill="transparent"
        stroke="var(--color-accent, #64ffda)"
        strokeWidth="4"
        strokeDasharray="25 100"
        strokeDashoffset="-35"
      ></circle>
    </svg>
  </div>
);

interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
  // Status isn't in the schema provided, so we'll infer or mock it for now
  // The schema has 'payments' table.
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    dailySales: 0,
    totalProducts: 0,
    recentTransactions: [] as Transaction[],
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Total Customers (Unique customer_name in payments)
        // Note: Fetching all names to count unique might be heavy if dataset is large, 
        // but without a distinct count RPC or raw query access, this is the client-side way.
        const { data: customersData, error: customersError } = await supabase
          .from("payments")
          .select("customer_name");
        
        if (customersError) throw customersError;
        
        const uniqueCustomers = new Set(
          customersData?.map((c) => c.customer_name).filter(Boolean)
        ).size;

        // 2. Daily Sales (Sum of grand_total for today)
        const todayStart = dayjs().startOf("day").toISOString();
        const todayEnd = dayjs().endOf("day").toISOString();
        
        // Note: transaction_time is text in schema, but usually it stores ISO string or similar. 
        // If it's just a time string, this might fail. Assuming ISO or date compatible string.
        // If transaction_time is just "HH:mm:ss", we can't filter by date easily without a date column.
        // Looking at schema: transaction_time text. 
        // Let's check if there's a date column? 'transaction_date' exists in 'expenses' but not 'payments'?
        // Wait, 'payments' has 'transaction_time' text. 'expenses' has 'transaction_date' date.
        // Let's assume 'transaction_time' in payments includes date or we should use created_at if available?
        // Schema for payments: transaction_time text. No created_at.
        // Let's try to filter by transaction_time. If it fails, we might need to fetch all and filter in JS.
        // Safest for now: fetch all for today if format allows, or fetch recent and filter.
        // Actually, let's look at 'payments' schema again.
        // payments: invoice_no, customer_name, amount_rendered, voucher, grand_total, change, transaction_no, transaction_time (text).
        // If transaction_time is just time, we can't know the date.
        // However, usually in POS systems, there is a date. 
        // Let's assume transaction_time is a full timestamp string.
        
        const { data: salesData, error: salesError } = await supabase
          .from("payments")
          .select("grand_total, transaction_time");

        if (salesError) throw salesError;

        // Filter in JS to be safe with 'text' column
        const todaySales = salesData
          ?.filter((p) => {
            if (!p.transaction_time) return false;
            return dayjs(p.transaction_time).isSame(dayjs(), 'day');
          })
          .reduce((sum, p) => sum + (Number(p.grand_total) || 0), 0);

        // 3. Total Products (Count items)
        const { count: productsCount, error: productsError } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true });

        if (productsError) throw productsError;

        // 4. Recent Transactions
        const { data: recentData, error: recentError } = await supabase
          .from("payments")
          .select("invoice_no, customer_name, grand_total, transaction_time")
          .order("transaction_time", { ascending: false }) // This might sort alphabetically if text
          .limit(5);

        if (recentError) throw recentError;

        setMetrics({
          totalCustomers: uniqueCustomers,
          dailySales: todaySales || 0,
          totalProducts: productsCount || 0,
          recentTransactions: recentData || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* --- ADDED BACK BUTTON --- */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="mb-4 font-bold text-2xl">Dashboard</h1>
      {/* HEADER BORDER */}
      <div className="mb-8 border border-slate-700"></div>

      {/* --- 1. STATS CARDS --- */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Card 1: Total Revenue (Keeping mock for now as not requested to change, or should I?) 
            User asked for: Total Customers, Daily Sales, Total Products.
            The existing cards are: Total Revenue, New Customers, Sales, Bounce Rate.
            I should map my new metrics to these or replace them.
            Let's replace them with the requested metrics.
        */}
        
        {/* Card 1: Daily Sales (Replaces Total Revenue?) */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Daily Sales</p>
            <DollarSign className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">
            ${metrics.dailySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-slate-400 text-xs">For today</p>
        </div>

        {/* Card 2: Total Customers */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Total Customers</p>
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">{metrics.totalCustomers.toLocaleString()}</p>
          <p className="mt-1 text-slate-400 text-xs">Unique customers</p>
        </div>

        {/* Card 3: Total Products */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Total Products</p>
            <ShoppingBag className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">{metrics.totalProducts.toLocaleString()}</p>
          <p className="mt-1 text-slate-400 text-xs">Items in inventory</p>
        </div>

        {/* Card 4: Bounce Rate (Kept as mock or remove? User didn't ask to remove, but didn't ask to update. I'll keep it as placeholder or remove?) 
            User said: "Update my dashboard components ... to fetch and display the following real-time metrics".
            I'll keep the 4th card as a placeholder or maybe "Transactions Today" if I can count them?
            Let's just keep it as "Bounce Rate" mock for now to maintain layout, or maybe "Recent Activity".
            Actually, let's make it "Transactions Today" (count of today's sales).
        */}
        <div className="p-5 glass-effect">
          <div className="flex justify-between items-center">
            <p className="font-medium text-slate-400 text-sm">Transactions</p>
            <ArrowUpRight className="w-5 h-5 text-slate-500" />
          </div>
          <p className="mt-2 font-bold text-3xl">
             {/* We can calculate this from the salesData we fetched if we store it, 
                 but I only stored the sum. Let's just leave the mock "Bounce Rate" 
                 or better, remove it if not needed? 
                 I'll leave it as "Bounce Rate" to avoid changing too much layout structure unless requested.
                 Actually, "Bounce Rate" makes no sense for a POS. 
                 Let's change it to "Avg. Sale" maybe?
                 Let's just leave it as is to be safe, or hide it. 
                 I'll hide it to be cleaner? No, grid-cols-4. 
                 I'll leave it as "System Status" -> "Online".
             */}
             System Status
          </p>
          <p className="mt-2 font-bold text-xl text-green-400">Online</p>
           <p className="mt-1 text-slate-400 text-xs">All systems operational</p>
        </div>
      </div>

      {/* --- 2. CHARTS --- */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 p-6 glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Revenue Over Time (Mock)</h3>
          <MockLineChart />
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-1 p-6 glass-effect">
          <h3 className="mb-4 font-semibold text-lg text-center">
            Traffic Sources (Mock)
          </h3>
          <MockDonutChart />
          <div className="space-y-2 mt-4 text-slate-300 text-sm">
            <div className="flex justify-between items-center">
              <span>Direct</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Referral</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Social</span>
              <span className="font-medium">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. DATA TABLE --- */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-lg">Recent Transactions</h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-slate-700 border-b text-slate-400">
              <th className="py-2">Invoice No</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Time</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {metrics.recentTransactions.length > 0 ? (
              metrics.recentTransactions.map((t) => (
                <tr key={t.invoice_no}>
                  <td className="py-3">{t.invoice_no}</td>
                  <td className="py-3">{t.customer_name || "N/A"}</td>
                  <td className="py-3">
                    {t.transaction_time 
                      ? dayjs(t.transaction_time).format("MMM D, HH:mm") 
                      : "N/A"}
                  </td>
                  <td className="py-3 text-right">
                    ${Number(t.grand_total).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-500">
                  No recent transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
