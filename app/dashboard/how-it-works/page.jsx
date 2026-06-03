import React from "react";

export default function HowItWorks() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-center mb-10">How It Works</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">1. Create Interview</h2>
          <p>
            Provide job details and requirements to generate tailored interview
            questions.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">2. Answer Questions</h2>
          <p>
            Record your answers using your microphone for each AI-generated
            question.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">3. Get Feedback</h2>
          <p>
            Receive instant, AI-powered feedback and a summary score for your
            performance.
          </p>
        </div>
      </div>
    </div>
  );
}
