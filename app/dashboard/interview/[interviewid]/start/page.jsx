"use client";
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection'
import RecordAnswerSection from './_components/RecordAnswerSection'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StartInterview({ params }) {
  const [interviewId, setInterviewId] = useState(null);
  const [interviewdata, setInterviewdata] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState({});
  const [activeQuestionIndex, setactiveQuestionIndex] = useState(0)

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
    <div className='flex flex-col gap-9'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Question */}
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />
        {/* Video/Audio Recording */}
        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewdata={interviewdata}
        />
      </div>
      <div className="flex justify-end gap-5">
        {activeQuestionIndex > 0 && <Button onClick={()=>{setactiveQuestionIndex(activeQuestionIndex-1)}}  className='bg-red-500'>Previous Question</Button>}
        {activeQuestionIndex != mockInterviewQuestion?.length - 1 && <Button onClick={()=>{setactiveQuestionIndex(activeQuestionIndex+1)}} className='bg-green-500'>Next Question</Button>}
        {activeQuestionIndex == mockInterviewQuestion?.length - 1 && <Link href={`/dashboard/interview/${interviewdata?.mockId}/feedback`}>
          <Button className='bg-blue-500'>Submit Interview</Button></Link>}

      </div>
    </div>

  );
}

export default StartInterview;
