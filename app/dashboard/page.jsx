import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import DashboardStats from "./_components/DashboardStats";
import { getUserAnalytics } from "../../lib/services/progressService";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const stats = email ? await getUserAnalytics(email) : null;

  return (
    <div className="p-6">
      <h2 className="font-bold text-2xl">Dashboard</h2>
      <h2 className="text-gray-500">
        Create and Start your AI mockup Interview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 my-5">
        <AddNewInterview weakestCategory={stats?.weakestCategory} />
      </div>

      <div className="my-6">
        <Link href="/dashboard/analytics">
          <Button className="w-full bg-black hover:bg-gray-800" size="lg">
            View Performance Analytics
          </Button>
        </Link>
      </div>
      <InterviewList />
    </div>
  );
}
