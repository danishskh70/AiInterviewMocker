// DESIGN SYSTEM APPLIED
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";

export default async function Dashboard() {
  return (
    <div className="flex flex-col gap-8 animate-fadeSlideUp">

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Create and start your AI mock interview
        </p>
      </div>

      {/* Add new interview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AddNewInterview />
      </div>

      {/* Analytics CTA */}
      <Link href="/dashboard/analytics">
        <Button
          size="lg"
          variant="outline"
          className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          View Performance Analytics
        </Button>
      </Link>

      {/* Interview list */}
      <InterviewList />

    </div>
  );
}
