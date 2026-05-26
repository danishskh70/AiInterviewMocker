"use client"
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import InterviewItemCard from './InterviewItemCard';
import { fetchInterviews } from '../actions';

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchInterviews(user.primaryEmailAddress.emailAddress).then(setInterviewList);
    }
  }, [user]);

  return (
    <div>
      <h2 className="font-medium text-xl"><strong>Previous Mock Interview</strong></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {interviewList.map((interview, index) => (
          <InterviewItemCard key={interview.id || index} interview={interview} />
        ))}
      </div>
    </div>
  );
}

export default InterviewList;
