// DESIGN SYSTEM APPLIED
"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { Mic, Square, Lock, CheckCircle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { eq } from "drizzle-orm";

// Timer constants — no magic numbers
const EDIT_TIMER_TOTAL = 15;
const EDIT_TIMER_WARN = 10;
const EDIT_TIMER_DANGER = 5;

function RecordAnswerSection({
  question,
  activeQuestionIndex,
  interviewData,
  setactiveQuestionIndex,
  questionsLength,
  answeredQuestions,
  setAnsweredQuestions,
  onNextQuestion,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editTimer, setEditTimer] = useState(EDIT_TIMER_TOTAL);
  const [showTimer, setShowTimer] = useState(false);

  const { user } = useUser();
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const isAnswered = answeredQuestions.has(activeQuestionIndex);

  // Derived timer color
  const timerBarColor =
    editTimer > EDIT_TIMER_WARN
      ? "bg-zinc-900"
      : editTimer > EDIT_TIMER_DANGER
        ? "bg-amber-400"
        : "bg-red-500";

  const timerTextColor =
    editTimer > EDIT_TIMER_WARN
      ? "text-zinc-600"
      : editTimer > EDIT_TIMER_DANGER
        ? "text-amber-600"
        : "text-red-600";

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    setUserAnswer("");
    setManualAnswer("");
    setShowTimer(false);
    setEditTimer(EDIT_TIMER_TOTAL);
    if (isRecording) stopSpeechToText();
  }, [activeQuestionIndex]);

  // Edit timer countdown
  useEffect(() => {
    if (!showTimer) return;
    if (editTimer <= 0) {
      setShowTimer(false);
      return;
    }
    timerRef.current = setTimeout(() => setEditTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [showTimer, editTimer]);

  const startSpeechToText = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => {
      setIsRecording(false);
      stopWaveform();
    };
    recognitionRef.current.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setUserAnswer((prev) => prev + " " + transcript);
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startWaveform(stream);
      recognitionRef.current.start();
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast.error("Microphone access denied");
    }
  };

  const stopSpeechToText = () => recognitionRef.current?.stop();

  async function startWaveform(stream) {
    streamRef.current = stream;
    audioCtxRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )();
    analyserRef.current = audioCtxRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    const source = audioCtxRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        // zinc-900 = #18181b — matches design system
        ctx.fillStyle = "#18181b";
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();
  }

  function stopWaveform() {
    cancelAnimationFrame(animationRef.current);
    audioCtxRef.current?.close();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  const HandleSubmit = async () => {
    const finalAnswer = userAnswer || manualAnswer;
    if (finalAnswer.length < 10) {
      toast.error("Answer too short");
      return;
    }

    setLoading(true);
    // Show edit timer
    setShowTimer(true);
    setEditTimer(EDIT_TIMER_TOTAL);

    try {
      const result = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question?.question,
          userAnswer: finalAnswer,
          modelAnswer: question?.modelAnswer,
          expectedKeywords: question?.expectedKeywords,
        }),
      });

      if (!result.ok) throw new Error("Failed to generate feedback");
      const feedbackData = await result.json();

      await db.delete(UserAnswer).where(eq(UserAnswer.questionId, question.id));
      await db.insert(UserAnswer).values({
        questionId: question.id,
        userAns: finalAnswer,
        feedback: JSON.stringify(feedbackData),
        rating: String(feedbackData.rating || "0"),
        userEmail: user?.primaryEmailAddress?.emailAddress,
      });

      setAnsweredQuestions(new Set(answeredQuestions.add(activeQuestionIndex)));
      toast.success("Answer submitted!");
      onNextQuestion();
    } catch (e) {
      console.error("Error submitting answer:", e);
      toast.error(e.message || "Failed to submit");
    } finally {
      setLoading(false);
      setShowTimer(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-6">
      <Tabs defaultValue="voice" className="flex-1">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 rounded-lg p-1">
          <TabsTrigger
            value="voice"
            disabled={isAnswered}
            className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=inactive]:text-zinc-500"
          >
            Voice Input
          </TabsTrigger>
          <TabsTrigger
            value="text"
            disabled={isAnswered}
            className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=inactive]:text-zinc-500"
          >
            Text Input
          </TabsTrigger>
        </TabsList>

        {/* Voice tab */}
        <TabsContent
          value="voice"
          className="flex flex-col items-center gap-4 py-8"
        >
          <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className={`rounded-md transition-opacity duration-300 ${
              isRecording ? "opacity-100" : "opacity-0"
            }`}
          />

          <Button
            variant={isRecording ? "outline" : "default"}
            onClick={() =>
              isRecording ? stopSpeechToText() : startSpeechToText()
            }
            disabled={isAnswered || loading}
            className={
              isRecording
                ? "border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2"
                : "bg-zinc-900 text-white hover:bg-zinc-700 flex items-center gap-2"
            }
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Start Recording
              </>
            )}
          </Button>

          <p className="text-xs text-zinc-500 text-center min-h-16 max-h-32 overflow-y-auto px-2">
            {userAnswer || "Transcript will appear here..."}
          </p>
        </TabsContent>

        {/* Text tab */}
        <TabsContent value="text" className="flex flex-col gap-2">
          <Textarea
            placeholder="Type your answer..."
            value={manualAnswer}
            onChange={(e) => setManualAnswer(e.target.value)}
            disabled={isAnswered}
            maxLength={1000}
            className="min-h-40 resize-none border-zinc-300 focus:ring-zinc-900 text-sm"
          />
          <p className="text-xs text-zinc-400 text-right">
            {manualAnswer.length}/1000
          </p>
        </TabsContent>
      </Tabs>

      {/* Edit timer bar */}
      {showTimer && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className={timerTextColor}>Time to edit</span>
            <span className={`font-mono font-bold ${timerTextColor}`}>
              {editTimer}s
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerBarColor}`}
              style={{ width: `${(editTimer / EDIT_TIMER_TOTAL) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit / locked state */}
      <div className="border-t border-zinc-100 pt-4">
        {isAnswered ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Answer Locked
            </span>
          </div>
        ) : (
          <Button
            onClick={HandleSubmit}
            disabled={loading}
            className="w-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </Button>
        )}
      </div>

      {/* Prev / Next nav */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setactiveQuestionIndex(activeQuestionIndex - 1)}
          disabled={activeQuestionIndex === 0}
          className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          onClick={() => setactiveQuestionIndex(activeQuestionIndex + 1)}
          disabled={activeQuestionIndex === questionsLength - 1}
          className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default RecordAnswerSection;
