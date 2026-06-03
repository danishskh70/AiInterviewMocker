// DESIGN SYSTEM APPLIED
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

function ExamHeader({ title, mode, answeredCount, totalCount, timeLeft }) {
  const progress = (answeredCount / totalCount) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer turns red under 5 minutes
  const timeWarning = timeLeft < 300;

  return (
    <header className="w-full bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2">

        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 truncate max-w-xs">
              {title}
            </h2>
            <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {mode}
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${
            timeWarning ? "text-red-600" : "text-zinc-900"
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress row */}
        <div className="flex items-center gap-3">
          <Progress
            value={progress}
            className="flex-1 h-1.5 bg-zinc-100 [&>div]:bg-zinc-900"
          />
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {answeredCount}/{totalCount} answered
          </span>
        </div>

      </div>
    </header>
  );
}

export default ExamHeader;