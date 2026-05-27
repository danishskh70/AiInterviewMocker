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
    <div className='p-6 md:p-10 max-w-7xl mx-auto'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Question Section */}
        <div className="flex flex-col">
          <QuestionSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
          />
        </div>
        
        {/* Video/Audio Recording Section */}
        <div className="flex flex-col">
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewdata={interviewdata}
            answeredQuestions={answeredQuestions}
            onAnswerSubmitted={() => setAnsweredQuestions(prev => new Set(prev).add(activeQuestionIndex))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 py-8 mt-6 border-t">
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setactiveQuestionIndex(activeQuestionIndex - 1)} variant="outline">
            Previous Question
          </Button>
        )}
        {activeQuestionIndex !== (mockInterviewQuestion?.length || 0) - 1 && (
          <Button 
            onClick={() => setactiveQuestionIndex(activeQuestionIndex + 1)} 
            disabled={!answeredQuestions.has(activeQuestionIndex)}
          >
            Next Question
          </Button>
        )}
        {activeQuestionIndex === (mockInterviewQuestion?.length || 0) - 1 && (
          <Link 
            href={`/dashboard/interview/${interviewdata?.mockId}/feedback`} 
            className={answeredQuestions.size < (mockInterviewQuestion?.length || 0) ? "pointer-events-none" : ""}
          >
            <Button 
              disabled={answeredQuestions.size < (mockInterviewQuestion?.length || 0)}
            >
              Submit Interview
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
