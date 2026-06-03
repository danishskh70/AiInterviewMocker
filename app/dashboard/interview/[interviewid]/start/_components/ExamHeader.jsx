import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

function ExamHeader({ title, mode, answeredCount, totalCount, timeLeft }) {
  const progress = (answeredCount / totalCount) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <Badge variant="secondary">{mode}</Badge>
        </div>
        <div className="text-sm font-mono font-bold">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Progress value={progress} className="w-full" />
        <span className="text-xs font-medium whitespace-nowrap">
          {answeredCount} / {totalCount} Answered
        </span>
      </div>
    </div>
  );
}

export default ExamHeader;
