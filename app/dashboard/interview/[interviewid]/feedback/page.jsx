"use client";

import { useParams, useRouter } from 'next/navigation'; // Import useParams to access route parameters
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [averageRating, setAverageRating] = useState({
    averageRating: 0,
    percentage: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (interviewid) {
      GetFeedback();
    } else {
      console.warn("Interview ID is undefined");
    }
  }, [interviewid]);

  const GetFeedback = async () => {
    console.log("Interview ID:", interviewid); // Check if interviewid is correct
    const result = await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, interviewid)).orderBy(UserAnswer.id);
    console.log("Feedback result:", result);
    
    setFeedbackData(result);
  
    if (result.length > 0) {
      // Calculate total rating by summing all feedback ratings
      const totalRating = result.reduce((sum, feedback) => sum + parseInt(feedback.rating), 0); // Ensure it's a number
      
      // Calculate average rating by dividing total by number of feedback entries
      const averageRating = totalRating / result.length;
      
      // Calculate percentage from the average rating (out of 10, so multiply by 10 for percentage)
      const percentage = (averageRating * 10).toFixed(1); // Multiply by 10 to convert to percentage (out of 100)
  
      // Set both values in the state
      setAverageRating({ averageRating: averageRating.toFixed(1), percentage: percentage });
    } else {
      setAverageRating({ averageRating: 0, percentage: 0 });
    }
  };
  

 

  return (
    <div className='p-10'>
      <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
      <h2 className='font-bold text-2xl mt-6'>Here is your Interview Feedback</h2>

      {feedbackData?.length == 0 ?
        <h2 className='font-bold text-2xl text-gray-500 border text-center w-full p-52 m-1 '>No Interview Feedback Record Found </h2>
        : 
        <div>
          <div className="text-center w-full p-5 m-1">
            
          <h2 className='text-blue-600 text-start text-lg my-3'>
  Your Overall Interview Rating: <strong>{averageRating.averageRating}/10</strong> ({averageRating.percentage}%)
</h2>

          <h2 className='text-sm text-start text-gray-500'>Find below Interview Question with correct Answer, your Answer, and feedback for your answer</h2>

          <div className="p-5 text-start">
            {/* Render feedback data */}
            {feedbackData.map((feedback, index) => (
              <Collapsible key={index} >
                <CollapsibleTrigger className=' p-3 flex gap-10 bg-gray-100 rounded-lg text-left justify-between my-2'>
                  Question {index + 1} : {feedback.question} <ChevronsUpDown className='h-s w-5' />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2 border p-6">
                    <h2 className='text-red-500 p-2 text-lg '>  <strong>Rating : </strong>  {feedback.rating} / 10</h2>

                    <p className='p-3 border rounded-lg bg-red-50 text-sm text-red-600 '><strong>Answer : </strong> {feedback.userAns}</p>
                    <p className='p-3 border rounded-lg bg-blue-50 text-sm text-blue-600 '><strong>Correct Answer : </strong> {feedback.correctAns}</p>
                    <p className='p-3 border rounded-lg bg-green-50 text-sm text-green-600 '><strong>Feedback : </strong> {feedback.feedback}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}


          </div>
          </div>
        </div>}
      <Button className='mt-4 justify-start' onClick={() => { router.replace('/dashboard') }}>Go Home </Button>
    </div>
  );
}

export default Feedback;

