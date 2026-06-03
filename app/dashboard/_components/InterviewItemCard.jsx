// DESIGN SYSTEM APPLIED
"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, Briefcase } from "lucide-react";
import React from "react";

function InterviewItemCard({ interview }) {
  const router = useRouter();

  const onStart = () => router.push(`/dashboard/interview/${interview?.mockId}`);
  const onFeedback = () => router.push(`/dashboard/interview/${interview?.mockId}/feedback`);

  const formattedDate = interview?.createdAt
    ? new Date(interview.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-base text-zinc-900 leading-tight">
          {interview?.jobPosition ?? "Untitled Role"}
        </h3>

        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Briefcase className="h-3 w-3" />
            {interview?.jobExperience} yr{interview?.jobExperience !== 1 ? "s" : ""} exp
          </span>

          {formattedDate && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {interview?.interviewType && (
          <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {interview.interviewType}
          </span>
        )}
        {interview?.difficulty && (
          <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {interview.difficulty}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onFeedback}
          className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
        >
          Feedback
        </Button>
        <Button
          size="sm"
          onClick={onStart}
          className="w-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
        >
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;