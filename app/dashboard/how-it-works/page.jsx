// DESIGN SYSTEM APPLIED
import React from "react";
import { PlusCircle, Mic, BarChart2 } from "lucide-react";

const steps = [
  {
    icon:        PlusCircle,
    number:      "01",
    title:       "Create Interview",
    description: "Provide job details and requirements to generate tailored interview questions powered by AI.",
  },
  {
    icon:        Mic,
    number:      "02",
    title:       "Answer Questions",
    description: "Record your answers using your microphone or type them out for each AI-generated question.",
  },
  {
    icon:        BarChart2,
    number:      "03",
    title:       "Get Feedback",
    description: "Receive instant AI-powered feedback, a summary score, and an improvement roadmap for your performance.",
  },
];

export default function HowItWorks() {
  return (
    <div className="flex flex-col gap-10 animate-fadeSlideUp">

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          How It Works
        </h1>
        <p className="text-sm text-zinc-500">
          Three steps to sharpen your interview skills
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map(({ icon: Icon, number, title, description }) => (
          <div
            key={number}
            className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* Step number + icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">
                {number}
              </span>
              <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <Icon className="h-4 w-4 text-zinc-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-zinc-900">
                {title}
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Connector line — desktop only */}
      <div className="hidden md:flex items-center justify-center gap-0 -mt-4">
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <div className="h-2 w-2 rounded-full bg-zinc-300" />
            {i < steps.length - 1 && (
              <div className="h-px w-32 bg-zinc-200" />
            )}
          </React.Fragment>
        ))}
      </div>

    </div>
  );
}