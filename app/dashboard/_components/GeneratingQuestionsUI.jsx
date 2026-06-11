import React, { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

const messages = [
  "Analyzing job description...",
  "Structuring interview...",
  "Generating questions..."
];

export const GeneratingQuestionsUI = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <LoaderCircle className="animate-spin h-10 w-10 text-zinc-900" />
      <p className="text-sm font-medium text-zinc-700 animate-pulse">
        {messages[index]}
      </p>
    </div>
  );
};
