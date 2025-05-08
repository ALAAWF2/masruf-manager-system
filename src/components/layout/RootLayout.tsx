
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-left" closeButton richColors />
    </div>
  );
}
