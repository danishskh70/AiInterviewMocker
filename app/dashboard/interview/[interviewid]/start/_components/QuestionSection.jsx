// DESIGN SYSTEM APPLIED
import {
  Volume2,
  PauseCircle,
  PlayCircle,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function QuestionSection({ questions, activeQuestionIndex, mode, answeredQuestions }) {
  const [isPaused, setIsPaused]   = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeQuestion = questions[activeQuestionIndex];

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [activeQuestionIndex]);

  const toggleSpeech = () => {
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(activeQuestion?.question);
        speech.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-6">

      {/* Question number pills */}
      <div className="flex gap-2 flex-wrap">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full transition-colors
              ${activeQuestionIndex === index
                ? "bg-zinc-900 text-white"
                : answeredQuestions.has(index)
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-zinc-100 text-zinc-500"
              }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Question text + listen */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 leading-relaxed">
          {activeQuestion?.question}
        </h2>

        <button
          onClick={toggleSpeech}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors w-fit"
        >
          {isPlaying
            ? isPaused
              ? <><PlayCircle className="h-4 w-4" /> Resume</>
              : <><PauseCircle className="h-4 w-4" /> Pause</>
            : <><Volume2 className="h-4 w-4" /> Listen</>
          }
        </button>
      </div>

      {/* Practice-only: hint + model answer */}
      {mode === "PRACTICE" && (
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4">

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
              View Hint
              <ChevronDown className="h-3.5 w-3.5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
              {activeQuestion?.hint}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
              Model Answer
              <ChevronDown className="h-3.5 w-3.5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 leading-relaxed">
              {activeQuestion?.modelAnswer}
            </CollapsibleContent>
          </Collapsible>

        </div>
      )}
    </div>
  );
}

export default QuestionSection;