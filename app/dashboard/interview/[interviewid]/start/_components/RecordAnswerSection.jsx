"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db';
import { chatSession } from '@/utils/GeminiAiModal';
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
    console.log("User Answer:", userAnswer);

    setLoading(true);
    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}, User answer: ${userAnswer}. Based on the question and user answer for the given interview question, please provide a rating and feedback as areas of improvement in just 3 to 5 lines in JSON format with "rating" with number up to 10  , and "feedback" fields. Ensure that response must not contain any symbols, special characters, or punctuation. Use only plain text in your response.`;

    try {
      const result = await chatSession.generateContent(feedbackPrompt);
      let rawfeedback = await result.response.text();


      console.log('Raw feedback from API:', rawfeedback);  // Log to see what is returned

      // Check if rawfeedback is empty or null
      if (!rawfeedback || rawfeedback.trim() === "") {
        console.error("Empty or null feedback received from API.");
        toast.error("Received empty feedback. Please try again.");
        setLoading(false);
        return;
      }
      rawfeedback = rawfeedback.replace(/```json|```/g, '').trim();

      // Improved feedback cleaning to remove potential unwanted characters
      const cleanedfeedback = rawfeedback.replace(/^```json\s*/i, '').replace(/\s*```$/, '').replace(/[^\x20-\x7E]+/g, '').trim();

      console.log('Cleaned feedback:', cleanedfeedback); // Log cleaned feedback

      // Parse the cleaned feedback as JSON
      let feedbackData;
      try {
        feedbackData = JSON.parse(cleanedfeedback);  // Attempt to parse JSON
      } catch (parseError) {
        console.error("Error parsing feedback JSON response:", parseError);
        toast.error("Invalid feedback format. Please try again.");
        setLoading(false);
        return;  // Stop execution if parsing fails
      }

      // Validate parsed feedback
      if (!feedbackData || !feedbackData.feedback || !feedbackData.rating) {
        toast.error("Failed to get valid feedback and rating. Please try again.");
        setLoading(false);
        return;
      }

      // Store the result in the database
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
        console.log("User Answer Recorded Successfully: " + resp);
        setUserAnswer(''); 
        setResults([]);
      }

      setResults([]);

    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate feedback. Please try again.");
    }


    setLoading(false);  // Stop the loading state
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
