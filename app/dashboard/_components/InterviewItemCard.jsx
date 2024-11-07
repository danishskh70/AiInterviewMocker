"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import React from 'react'

function InterviewItemCard({interview}) {
  const router=useRouter();
  const onStart=()=>{
    router.push(`/dashboard/interview/${interview?.mockId}`)
  }
  const onFeedback=()=>{
    router.push(`/dashboard/interview/${interview?.mockId}/feedback`)
  }
  return (
    <div className=' border rounded-lg shadow-sm p-2 '>
      <h2 className='font-bold text-md text-blue-800 p-1 underline'>{interview?.jobPosition}</h2>
      <h2 className='text-sm text-grey-600 p-1 '>Experience  of {interview?.jobExperience} years</h2>
      <h2 className='text-xs text-gray-500 p-1'>Created At : {interview?.createdAt}</h2>
   <div className=" flex justify-between gap-10 mt-2">
   <Button size='sm' variant='outline' className='w-full' onClick={onFeedback}>Feedback</Button>
   <Button size='sm'className='w-full' onClick={onStart} >Start</Button>
   </div>
    </div>
  )
}

export default InterviewItemCard