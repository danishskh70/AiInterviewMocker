"use client";

import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Star, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const router = useRouter();

  useEffect(() => {
    if (interviewid) GetFeedback();
  }, [interviewid]);

  const GetFeedback = async () => {
    const result = await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, interviewid)).orderBy(UserAnswer.id);
    
    if (result.length > 0) {
      const totalRating = result.reduce((sum, item) => sum + (parseFloat(item.rating) || 0), 0);
      setStats({ average: (totalRating / result.length).toFixed(1), count: result.length });
    }
    setFeedbackData(result);
  };

  return (
    <div className='p-6 md:p-10 max-w-5xl mx-auto'>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Interview Feedback</h1>
          <p className='text-slate-500'>Review your performance and areas for improvement.</p>
        </div>
        <Button onClick={() => router.replace('/dashboard')}>Go to Dashboard</Button>
      </div>

      {feedbackData.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">No feedback found for this interview.</Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
                <Award className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.average} / 10</div>
                <p className="text-xs text-blue-600">Based on {stats.count} questions answered</p>
              </CardContent>
            </Card>
          </div>

          <h2 className='text-xl font-semibold mt-8'>Question Analysis</h2>
          {feedbackData.map((fb, index) => (
            <Collapsible key={index} className="border rounded-xl shadow-sm bg-white">
              <CollapsibleTrigger className='w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors'>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">Q{index + 1}</span>
                  <span className="font-medium text-left truncate">{fb.question}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${parseFloat(fb.rating) >= 7 ? 'text-green-600' : 'text-amber-600'}`}>
                    {fb.rating}/10
                  </span>
                  <ChevronsUpDown className='h-4 w-4 text-slate-400' />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 border-t bg-slate-50">
                <div className="grid gap-4 pt-4">
                  <div className="grid gap-1">
                    <h4 className="text-sm font-semibold text-slate-900">Your Answer</h4>
                    <p className="text-sm text-slate-600 bg-white p-3 rounded-md border">{fb.userAns}</p>
                  </div>
                  <div className="grid gap-1">
                    <h4 className="text-sm font-semibold text-slate-900">Expert Feedback</h4>
                    <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-md border border-emerald-100">{fb.feedback}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feedback;

