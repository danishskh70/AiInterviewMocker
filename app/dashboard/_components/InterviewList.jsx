// DESIGN SYSTEM APPLIED
"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { fetchInterviews } from "../actions";

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchInterviews(user.primaryEmailAddress.emailAddress)
        .then(setInterviewList)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Previous Interviews
      </h2>

      {/* Skeleton loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && interviewList.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center border border-zinc-200 border-dashed rounded-xl">
          <p className="text-sm font-medium text-zinc-900">No interviews yet</p>
          <p className="text-sm text-zinc-500">
            Create your first mock interview above
          </p>
        </div>
      )}

      {/* Interview cards */}
      {!loading && interviewList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewList.map((interview, index) => (
            <InterviewItemCard
              key={interview.id || index}
              interview={interview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewList;