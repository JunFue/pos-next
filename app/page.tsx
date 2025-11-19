"use client"; // Necessary for useState

import React, { useState, useEffect, useRef } from "react";
import Navigation from "../components/navigation/Navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  LogIn,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Brain,
} from "lucide-react";

// --- Mock Components for Header ---

// 1. Search Bar
const SearchBar = () => (
  <div className="hidden md:block relative">
    <Search className="top-1/2 left-3 absolute w-4 h-4 text-slate-400 -translate-y-1/2" />
    <input
      type="text"
      placeholder="Search..."
      className="bg-slate-800/50 py-2.5 pr-4 pl-10 border border-slate-700 focus:border-cyan-500/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 w-64 text-slate-200 text-sm transition-all"
    />
  </div>
);

// 2. Notifications Component
const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockAlerts = [
    { id: 1, title: "New Order Received", time: "2 min ago", type: "success" },
    {
      id: 2,
      title: "Inventory Low: Keycaps",
      time: "1 hour ago",
      type: "alert",
    },
    {
      id: 3,
      title: "Server Update Completed",
      time: "3 hours ago",
      type: "info",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-white/10 p-2.5 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="top-2.5 right-2.5 absolute bg-red-500 border-2 border-slate-900 rounded-full w-2 h-2"></span>
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a] shadow-2xl mt-3 border border-slate-700 rounded-2xl w-80 overflow-hidden origin-top-right animate-in duration-100 fade-in zoom-in-95">
          <div className="flex justify-between items-center bg-slate-800/30 px-4 py-3 border-slate-700 border-b">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <span className="text-cyan-400 text-xs hover:underline cursor-pointer">
              Mark all read
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex gap-3 hover:bg-white/5 px-4 py-3 border-slate-800/50 border-b transition-colors cursor-pointer"
              >
                <div className="mt-1">
                  {alert.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : alert.type === "alert" ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-slate-200 text-sm">{alert.title}</p>
                  <p className="mt-0.5 text-slate-500 text-xs">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 3. User Profile Component
const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = {
    name: "JunFue Admin",
    email: "admin@junfue.com",
    role: "Super User",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-center items-center bg-gradient-to-br from-slate-700 to-slate-600 rounded-full hover:ring-2 hover:ring-cyan-500/50 w-10 h-10 transition-all"
      >
        <User className="w-5 h-5 text-slate-200" />
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a] shadow-2xl mt-3 border border-slate-700 rounded-2xl w-64 overflow-hidden origin-top-right animate-in duration-100 fade-in zoom-in-95">
          <div className="bg-slate-800/30 p-5 border-slate-700 border-b">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="mt-1 text-slate-400 text-xs">{user.email}</p>
            <span className="inline-block bg-cyan-500/20 mt-2 px-2 py-0.5 border border-cyan-500/30 rounded font-bold text-[10px] text-cyan-400 uppercase">
              {user.role}
            </span>
          </div>
          <div className="space-y-1 p-2">
            <button className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg w-full text-slate-300 hover:text-white text-sm transition-colors">
              <Settings className="w-4 h-4" /> Account Settings
            </button>
            <div className="my-1 border-slate-700/50 border-t"></div>
            <button className="flex items-center gap-3 hover:bg-red-500/10 px-3 py-2 rounded-lg w-full text-red-400 text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <button className="flex items-center gap-3 hover:bg-green-500/10 px-3 py-2 rounded-lg w-full text-green-400 text-sm transition-colors">
              <LogIn className="w-4 h-4" /> Switch Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function DashboardHomePage() {
  return (
    <div className="bg-[#0B1120] p-6 min-h-screen text-white">
      {" "}
      {/* Darker background to match image */}
      {/* 1. HEADER SECTION */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Home Page</h1>
          <p className="mt-1 text-slate-500 text-sm">Welcome back, Admin</p>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />
          <div className="hidden md:block bg-slate-700 mx-1 w-px h-8"></div>
          <Notifications />
          <UserProfile />
        </div>
      </header>
      {/* Divider (Optional, but keeps layout clean) */}
      {/* <div className="mb-8 border-slate-800 border-b"></div> */}
      {/* 2. NAVIGATION GRID */}
      <Navigation />
      {/* 3. STATS CARDS */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8">
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col gap-6">
          {/* Total Customers Card */}
          <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
            <h3 className="font-medium text-slate-400 text-sm uppercase tracking-wider">
              Total Customers
            </h3>
            <p className="mt-3 font-bold text-white text-5xl tracking-tighter">
              10,238
            </p>
            <p className="flex items-center gap-2 mt-2 font-medium text-green-400 text-sm">
              <TrendingDown className="w-4 h-4 rotate-180" />
              +12% from last month
            </p>
          </div>

          {/* Daily Sales Card */}
          <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
            <h3 className="font-medium text-slate-400 text-sm uppercase tracking-wider">
              Daily Sales
            </h3>
            <p className="mt-3 font-bold text-white text-5xl tracking-tighter">
              $73,495
            </p>
            <p className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
              <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
              Pending validation: 4
            </p>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="flex flex-col gap-6">
          {/* JunFue Chat Card */}
          <div className="flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/80 p-8 border border-slate-800 rounded-2xl glass-effect">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h3 className="font-semibold text-slate-200">JunFue Chat</h3>
            </div>

            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
                <p className="text-sm leading-relaxed">
                  System optimization recommended for inventory module.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
                <p className="text-sm leading-relaxed">
                  New supplier metrics available for review.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
                <p className="text-sm leading-relaxed">
                  Expiration alerts for Batch #902.
                </p>
              </div>
            </div>
          </div>

          {/* See More Button */}
          <button className="group hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,189,212,0.15)] p-4 border border-slate-700 hover:border-cyan-500 rounded-xl w-full font-semibold text-white text-lg transition-all glass-effect">
            See More Details
          </button>
        </div>
      </div>
    </div>
  );
}
