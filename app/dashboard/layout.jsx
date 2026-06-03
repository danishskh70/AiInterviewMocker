// DESIGN SYSTEM APPLIED
import React from "react";
import Header from "./_components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
