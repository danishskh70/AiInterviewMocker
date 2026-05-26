"use client";

import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (interviewid) GetFeedback();
  }, [interviewid]);

  const GetFeedback = async () => {
    const result = await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, interviewid)).orderBy(UserAnswer.id);
    setFeedbackData(result);
  };

  const nextCard = () => setCurrentIndex((prev) => Math.min(prev + 1, feedbackData.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div className='p-6 md:p-10 max-w-3xl mx-auto'>
      <div className="flex items-center justify-between mb-8">
        <h1 className='text-2xl font-bold'>Interview Feedback</h1>
        <Button variant="outline" onClick={() => router.replace('/dashboard')}>Dashboard</Button>
      </div>

      {feedbackData.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">No feedback found.</Card>
      ) : (
        <div className="relative">
          <Card className="min-h-[400px] flex flex-col justify-between">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded-full">Question {currentIndex + 1} / {feedbackData.length}</span>
                <span className={`font-bold text-lg ${parseFloat(feedbackData[currentIndex].rating) >= 7 ? 'text-green-600' : 'text-amber-600'}`}>
                  {feedbackData[currentIndex].rating}/10
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-6">{feedbackData[currentIndex].question}</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Answer</h4>
                  <p className="text-slate-700">{feedbackData[currentIndex].userAns}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Expert Feedback</h4>
                  <p className="text-emerald-900">{feedbackData[currentIndex].feedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button onClick={prevCard} disabled={currentIndex === 0}><ChevronLeft /> Previous</Button>
            <Button onClick={nextCard} disabled={currentIndex === feedbackData.length - 1}>Next <ChevronRight /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;

