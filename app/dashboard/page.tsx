import Link from "next/link";
import { BarChart, DollarSign, Package } from "lucide-react"; // Using lucide-react for icons

// This is the content for the RIGHT window when at /dashboard
export default function DashboardHomePage() {
  return (
    <div className="text-white">
      {/* 1. Page Header */}
      <h1 className="mb-4 font-bold text-3xl">Dashboard</h1>
      <p className="mb-8 text-gray-300 text-lg">
        Welcome! Here`&apos;s an overview of your sales activity.
      </p>

      {/* 2. Example Navigation Bar */}
      <nav className="flex flex-wrap gap-4 mb-8">
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/reports"
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          Reports
        </Link>
        <Link
          href="/dashboard/inventory"
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          Inventory
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          Settings
        </Link>
      </nav>

      {/* 3. Example Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="bg-gray-800 p-6 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Today`&apos;`s Revenue</p>
              <p className="font-bold text-2xl">$1,284.50</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-800 p-6 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Items Sold</p>
              <p className="font-bold text-2xl">72</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-800 p-6 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-4">
            <BarChart className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">Average Sale</p>
              <p className="font-bold text-2xl">$17.84</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
