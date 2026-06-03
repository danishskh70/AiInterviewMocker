"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { Mic, Square, Lock } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { eq } from "drizzle-orm";

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
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);

  const isAnswered = answeredQuestions.has(activeQuestionIndex);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    setUserAnswer("");
    setManualAnswer("");
    if (isRecording) stopSpeechToText();
  }, [activeQuestionIndex]);

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
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
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
        ctx.fillStyle = `rgb(99, 102, 241)`;
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
    try {
      // 1. Get Feedback
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

      // 2. Save to DB
      await db.delete(UserAnswer).where(eq(UserAnswer.questionId, question.id));
      await db.insert(UserAnswer).values({
        questionId: question.id,
        userAns: finalAnswer,
        feedback: JSON.stringify(feedbackData), // Store as JSON string for now
        rating: String(feedbackData.rating || "0"),
        userEmail: user?.primaryEmailAddress?.emailAddress,
      });

      setAnsweredQuestions(new Set(answeredQuestions.add(activeQuestionIndex)));
      toast.success("Answer submitted!");
      onNextQuestion(); // Auto-next!
    } catch (e) {
      console.error("Error submitting answer:", e);
      toast.error(e.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <Tabs defaultValue="voice" className="flex-1">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="voice" disabled={isAnswered}>
            Voice Input
          </TabsTrigger>
          <TabsTrigger value="text" disabled={isAnswered}>
            Text Input
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="voice"
          className="flex flex-col items-center justify-center py-10"
        >
          <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className={`rounded-md mb-4 ${
              isRecording ? "opacity-100" : "opacity-0"
            } transition-opacity`}
          />
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={() =>
              isRecording ? stopSpeechToText() : startSpeechToText()
            }
            disabled={isAnswered || loading}
          >
            {isRecording ? (
              <Square size={18} className="mr-2" />
            ) : (
              <Mic size={18} className="mr-2" />
            )}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          <p className="mt-4 text-xs text-gray-500 min-h-20 max-h-40 overflow-y-auto">
            {userAnswer || "Transcript will appear here..."}
          </p>
        </TabsContent>

        <TabsContent value="text" className="h-64 flex flex-col">
          <Textarea
            className="flex-1"
            placeholder="Type your answer..."
            value={manualAnswer}
            onChange={(e) => setManualAnswer(e.target.value)}
            disabled={isAnswered}
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-2 text-right">
            {manualAnswer.length}/1000 characters
          </p>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        {isAnswered ? (
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
            <Lock size={16} /> ANSWER LOCKED
          </div>
        ) : (
          <Button onClick={HandleSubmit} disabled={loading} className="w-full">
            SUBMIT ANSWER
          </Button>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={() => setactiveQuestionIndex(activeQuestionIndex - 1)}
          disabled={activeQuestionIndex === 0}
          variant="ghost"
        >
          Previous
        </Button>
        <Button
          onClick={() => setactiveQuestionIndex(activeQuestionIndex + 1)}
          disabled={activeQuestionIndex === questionsLength - 1}
          variant="ghost"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
export default RecordAnswerSection;
