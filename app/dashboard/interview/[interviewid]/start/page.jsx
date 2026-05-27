"use client";
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection'
import dynamic from 'next/dynamic';

const RecordAnswerSection = dynamic(
  () => import('./_components/RecordAnswerSection'),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StartInterview({ params }) {
  const [interviewId, setInterviewId] = useState(null);
  const [interviewdata, setInterviewdata] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState({});
  const [activeQuestionIndex, setactiveQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setInterviewId(resolvedParams.interviewid);
      GetInterviewDetails(resolvedParams.interviewid);
    })();
  }, [params]);

 
  const GetInterviewDetails = async (id) => {
    const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, id));

    const interview = result[0] || {};

    // Log the interview data for debugging
    console.log("Fetched interview data:", interview);

    setInterviewdata(interview);

    if (interview?.jsonResponse) {

      try {

        const cleanedResponse = interview.jsonResponse
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        const jsonMockResp = JSON.parse(cleanedResponse);
        setMockInterviewQuestion(jsonMockResp);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
      }
    } else {
      console.error("No valid JSON response found in jsonResponse.");
    }
  };

  return (
    <div className='flex flex-col h-screen p-6 -mt-12'>
      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-10 flex-grow overflow-hidden">
        {/* Question */}
        <div className="overflow-y-auto no-scrollbar">
          <QuestionSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
          />
        </div>
        {/* Video/Audio Recording */}
        <div className="overflow-y-auto no-scrollbar">
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewdata={interviewdata}
            answeredQuestions={answeredQuestions}
            onAnswerSubmitted={() => setAnsweredQuestions(prev => new Set(prev).add(activeQuestionIndex))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-5 py-4 border-t">
        {activeQuestionIndex > 0 && <Button onClick={()=>{setactiveQuestionIndex(activeQuestionIndex-1)}}  className='bg-red-500'>Previous Question</Button>}
        {activeQuestionIndex != mockInterviewQuestion?.length - 1 && 
          <Button 
            onClick={()=>{setactiveQuestionIndex(activeQuestionIndex+1)}} 
            className='bg-green-500'
            disabled={!answeredQuestions.has(activeQuestionIndex)}
          >
            Next Question
          </Button>
        }
        {activeQuestionIndex == mockInterviewQuestion?.length - 1 && 
          <Link href={`/dashboard/interview/${interviewdata?.mockId}/feedback`} className={answeredQuestions.size < mockInterviewQuestion?.length ? "pointer-events-none" : ""}>
            <Button 
              className='bg-blue-500'
              disabled={answeredQuestions.size < mockInterviewQuestion?.length}
            >
              Submit Interview
            </Button>
          </Link>
        }

      </div>
    </div>

  );
}

export default StartInterview;
