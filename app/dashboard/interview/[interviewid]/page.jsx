"use client";
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';

function Interview({ params }) {
  const [interviewId, setInterviewId] = useState('');
  const [interviewdata, setInterviewdata] = useState({});
  const [webcamEnable, setWebcamEnable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle the Promise in params to safely retrieve interviewId
    (async () => {
      if (params instanceof Promise) {
        const resolvedParams = await params;
        if (resolvedParams.interviewid) {
          setInterviewId(resolvedParams.interviewid);
          GetInterviewDetails(resolvedParams.interviewid);
        }
      } else if (params && params.interviewid) {
        setInterviewId(params.interviewid);
        GetInterviewDetails(params.interviewid);
      }
    })();
  }, [params]);

  // Fetch interview details by MockId 
  const GetInterviewDetails = async (id) => {
    const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, id));
    setInterviewdata(result[0] || {});
  };

  return (
    <div>
      <div className='my-10 flex justify-center flex-col items-center'>
        <h2 className='font-bold text-2xl'>Let's Get Started</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

          <div className='flex flex-col my-5 gap-5'>
            <div className='flex flex-col my-5 gap-5 p-5 rounded-lg border'>
              <h2 className='text-lg'><strong>Job Role/Job Position:</strong> {interviewdata.jobPosition || 'Not Available'}</h2>
              <h2 className='text-lg'><strong>Job Description/Tech Stack:</strong> {interviewdata.jobDesc || 'Not Available'}</h2>
              <h2 className='text-lg'><strong>Years of Experience:</strong> {interviewdata.jobExperience || 'Not Available'}</h2>
            </div>
            <div className='p-5 border-yellow-300 rounded-lg bg-yellow-100'>
              <h2 className='flex gap-2 items-center text-yellow-500'><Lightbulb /><strong>Information</strong></h2>
              <p className='mt-3 text-yellow-600'>
              • Press <strong>Record</strong> for each question; each answer needs a new recording.<br />
          • Recording stops automatically after one second of silence, or you can press <strong>Stop</strong> when done.<br />
          • Click <strong>Next Question</strong> after recording to proceed smoothly.<br />
          • Submit all answers at the end to receive feedback.<br />
          • Take a moment to plan each answer—clear, concise responses are best.
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-5'>
            {webcamEnable ? (
              <Webcam
                onUserMedia={() => setWebcamEnable(true)}
                onUserMediaError={() => setWebcamEnable(false)}
                style={{ height: 600, width: 600 }}
                mirrored={true}
              />
            ) : (
              <>
                <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                <Button
                  className='w-full hover:bg-gray-200'
                  variant='ghost'
                  onClick={() => setWebcamEnable(true)}
                >
                  Enable WebCam and Microphone
                </Button>
              </>
            )}
            {interviewId && (
              <div className="flex justify-end items-end">
                <Link href={`/dashboard/interview/${interviewId}/start`}>
                  <Button onClick={() => router.push(`/dashboard/interview/${interviewId}/start`)}>
                    Start
                  </Button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Interview;
