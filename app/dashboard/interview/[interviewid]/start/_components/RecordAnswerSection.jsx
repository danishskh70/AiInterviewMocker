"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { Mic, StopCircle } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import useSpeechToText from 'react-hook-speech-to-text';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam'

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewdata }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedbackData, setFeedbackData] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);


  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });
  useEffect(() => {
    console.log('Speech-to-Text Results:', results);
    results.map((result) => {
      setUserAnswer(prevAns => prevAns + result?.transcript)
    });
  }, [results]);
  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      console.log('User Answer:', userAnswer);
      UpdateUserAnswer();
    }
  }, [userAnswer, isRecording]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };
  const UpdateUserAnswer = async () => {
    setLoading(true);

    try {
      const result = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: mockInterviewQuestion[activeQuestionIndex]?.Question,
          userAnswer: userAnswer
        }),
      });

      if (!result.ok) throw new Error("Failed to generate feedback");
      const feedbackData = await result.json();

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewdata.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: userAnswer,
        feedback: feedbackData.feedback,
        rating: feedbackData.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy')
      });

      if (resp) {
        toast.success("Answer recorded!");
        setUserAnswer(''); 
        setResults([]);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      toast.error("Failed to process feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className='flex flex-col justify-center items-center bg-black rounded-2xl p-1 mt-20'>
        <Image src={'/webcam2-removebg-preview.png'} width={250} height={250} className='absolute' alt='Webcam.png' />
        <Webcam style={{
          height: 400,
          width: '100%',
          zIndex: 10
        }}
          mirrored={true} />
      </div>
      <Button
        disabled={loading}
        className='my-7 text-blue-500' variant="outline"
        onClick={StartStopRecording}      >
        {isRecording ?
          <h2 className='flex gap-2 animate-pulse items-center text-red-600'>
            <StopCircle />  Stop Recording.......
          </h2>
          :
          <h2 className='flex gap-3 items-center text-blue-600' > <Mic /> Record Answer</h2>}</Button>
    </div>
  )
}


export default RecordAnswerSection
