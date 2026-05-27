"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const DynamicWebcam = dynamic(() => import('react-webcam'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-2xl" />,
});

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewdata, answeredQuestions, onAnswerSubmitted }) {
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
    // Reset answers when question changes
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
      if (e.error === 'no-speech') return; // ignore silence timeout
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
        const errText = await result.text();
        console.error("Feedback API error:", errText);
        throw new Error(`Failed to generate feedback: ${errText}`);
      }

      const feedbackData = await result.json();

      const resp = await db.insert(UserAnswer).values({
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

      if (resp) {
        toast.success("Answer recorded!");
        setUserAnswer(''); 
        setManualAnswer('');
        onAnswerSubmitted();
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      toast.error("Failed to process feedback. Check console for details.");
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
        toast.error("Mic blocked: " + err.message);
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
    <div className="flex flex-col items-center justify-center p-4">
      {/* Increased Webcam Size Container */}
      <div className='relative w-full max-w-xl aspect-video flex flex-col justify-center items-center bg-black rounded-xl p-0.5 shadow-md overflow-hidden'>
        <DynamicWebcam 
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
          }}
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
              placeholder={isAnswered ? "Already submitted" : "Type your answer here..."}
              value={manualAnswer}
              onChange={(e) => setManualAnswer(e.target.value)}
              className="h-32"
            />
            <div className="flex gap-3 mt-3">
              <Button onClick={HandleSubmit} disabled={loading || isAnswered}>Submit Answer</Button>
              <Button variant="ghost" onClick={() => setUseManual(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            disabled={loading || isAnswered}
            className={`h-12 w-full text-lg font-semibold transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            onClick={StartStopRecording}
          >
            {isAnswered ? "Already Answered" : isRecording ?
              <span className='flex gap-2 items-center'>
                <StopCircle className="h-5 w-5" /> Stop Recording
              </span>
              :
              <span className='flex gap-2 items-center' > <Mic className="h-5 w-5" /> Record Answer</span>}
          </Button>
        )}

        {!useManual && !isAnswered && (
          <Button variant="outline" className="text-muted-foreground w-full" onClick={() => setUseManual(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Or type answer manually
          </Button>
        )}
      </div>
    </div>
  )
}
export default RecordAnswerSection
