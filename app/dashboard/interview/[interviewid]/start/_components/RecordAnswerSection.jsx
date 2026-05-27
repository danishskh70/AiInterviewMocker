"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const DynamicWebcam = dynamic(() => import('react-webcam'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-2xl" />,
});

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewdata, answeredQuestions, onAnswerSubmitted, setactiveQuestionIndex, mockInterviewQuestionLength, mockId }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [manualAnswer, setManualAnswer] = useState('')
  const [useManual, setUseManual] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const isAnswered = answeredQuestions?.has(activeQuestionIndex);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    setUserAnswer('');
    setManualAnswer('');
    if (isRecording) stopSpeechToText();
  }, [activeQuestionIndex]);

  const startSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser doesn't support speech recognition");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = (e) => {
      if (e.error === 'no-speech') return;
      console.error("Recognition error:", e.error);
      toast.error("Mic error: " + e.error);
      setIsRecording(false);
    };
    recognitionRef.current.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript).join(' ');
      setUserAnswer(prev => prev + ' ' + transcript);
    };

    recognitionRef.current.start();
  };

  const stopSpeechToText = () => {
    recognitionRef.current?.stop();
  };

  const HandleSubmit = async () => {
    const finalAnswer = useManual ? manualAnswer : userAnswer;
    if (finalAnswer.length < 10) {
      toast.error("Answer is too short!");
      return;
    }
    await UpdateUserAnswer(finalAnswer);
  };

  const UpdateUserAnswer = async (answerToSave) => {
    setLoading(true);

    try {
      const result = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: mockInterviewQuestion[activeQuestionIndex]?.Question,
          userAnswer: answerToSave,
          idealAnswer: mockInterviewQuestion[activeQuestionIndex]?.Answer
        }),
      });

      if (!result.ok) {
        throw new Error(`Failed to generate feedback`);
      }

      const feedbackData = await result.json();

      await db.insert(UserAnswer).values({
        mockIdRef: interviewdata.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: answerToSave,
        feedback: feedbackData.feedback,
        rating: feedbackData.rating,
        fillerWordsCount: feedbackData.fillerWordsCount,
        speakingRateScore: feedbackData.speakingRateScore,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: format(new Date(), 'dd-MM-yyyy')
      });

      toast.success("Answer recorded!");
      setUserAnswer(''); 
      setManualAnswer('');
      onAnswerSubmitted();
    } catch (error) {
      console.error("Error processing answer:", error);
      toast.error("Failed to process feedback.");
    } finally {
      setLoading(false);
    }
  };

  const StartStopRecording = async () => {
    if (isStarting) return;
    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        toast.error("Mic blocked");
        return;
      }
      setIsStarting(true);
      startSpeechToText();
      setTimeout(() => setIsStarting(false), 1000);
    } else {
      stopSpeechToText();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className='relative w-full max-w-xl aspect-video flex flex-col justify-center items-center bg-black rounded-xl p-0.5 shadow-md overflow-hidden'>
        <DynamicWebcam 
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          mirrored={true} 
        />
        {isRecording && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
            REC
          </div>
        )}
      </div>
      
      <div className="w-full max-w-xl mt-2 flex flex-col gap-2">
        {useManual ? (
          <div className="mt-4">
            <Textarea 
              disabled={isAnswered}
              placeholder="Type your answer here..."
              value={manualAnswer}
              onChange={(e) => setManualAnswer(e.target.value)}
              className="h-32"
            />
            <div className="flex gap-3 mt-3">
              <Button onClick={HandleSubmit} disabled={loading || isAnswered}>Submit</Button>
              <Button variant="ghost" onClick={() => setUseManual(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            disabled={loading || isAnswered}
            className={`h-12 w-full text-lg font-semibold ${isRecording ? 'bg-red-600' : 'bg-blue-600'}`}
            onClick={StartStopRecording}
          >
            {isAnswered ? "Answered" : isRecording ? "Stop Recording" : "Record Answer"}
          </Button>
        )}

        {!useManual && !isAnswered && (
          <Button variant="outline" className="text-muted-foreground w-full" onClick={() => setUseManual(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Type Manually
          </Button>
        )}
      </div>

      <div className="w-full max-w-xl flex justify-end gap-2 mt-4">
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setactiveQuestionIndex(activeQuestionIndex - 1)} variant="outline">Previous</Button>
        )}
        {activeQuestionIndex !== mockInterviewQuestionLength - 1 && (
          <Button onClick={() => setactiveQuestionIndex(activeQuestionIndex + 1)} disabled={!answeredQuestions.has(activeQuestionIndex)}>Next</Button>
        )}
        {activeQuestionIndex === mockInterviewQuestionLength - 1 && (
          <Link href={`/dashboard/interview/${mockId}/feedback`} className={answeredQuestions.size < mockInterviewQuestionLength ? "pointer-events-none" : ""}>
            <Button disabled={answeredQuestions.size < mockInterviewQuestionLength}>Submit</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
export default RecordAnswerSection
