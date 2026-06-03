"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function InterviewItemCard({ interview }) {
  const router = useRouter();
  const onStart = () => {
    router.push(`/dashboard/interview/${interview?.mockId}`);
  };
  const onFeedback = () => {
    router.push(`/dashboard/interview/${interview?.mockId}/feedback`);
  };
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold text-lg text-black">
        {interview?.jobPosition}
      </h2>
      <h2 className="text-sm text-gray-600">
        Experience of {interview?.jobExperience} years
      </h2>
      <h2 className="text-xs text-gray-400 mt-1">
        Created At: {interview?.createdAt}
      </h2>
      <div className="flex justify-between gap-4 mt-4">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onFeedback}
        >
          Feedback
        </Button>
        <Button size="sm" className="w-full" onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
