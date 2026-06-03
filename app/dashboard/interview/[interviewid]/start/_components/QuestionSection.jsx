import {
  Volume2,
  PauseCircle,
  PlayCircle,
  Square,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function QuestionSection({ questions, activeQuestionIndex, mode, answeredQuestions }) {
  const [isPaused, setIsPaused] = useState(false);
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
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex gap-2 mb-8 flex-wrap">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full transition-colors 
              ${activeQuestionIndex === index ? "bg-black text-white" : 
                answeredQuestions.has(index) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 leading-snug">
          {activeQuestion?.question}
        </h2>
        <button onClick={toggleSpeech} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black">
          {isPlaying ? (isPaused ? <PlayCircle size={16}/> : <PauseCircle size={16}/>) : <Volume2 size={16}/>}
          {isPlaying ? (isPaused ? "RESUME" : "PAUSE") : "LISTEN"}
        </button>
      </div>

      {mode === "PRACTICE" && (
        <div className="mt-8 space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">
              View Hint <ChevronDown size={14}/>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
              {activeQuestion?.hint}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">
              Model Answer <ChevronDown size={14}/>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
              {activeQuestion?.modelAnswer}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

export default QuestionSection;
