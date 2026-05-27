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

  const handleEnableWebcamAndMic = async () => {
    try {
      // Request both devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamEnable(true);
    } catch (err) {
      console.error("Access denied:", err);
      alert("Please allow camera and microphone access to continue.");
    }
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
            <div className='p-5 border rounded-lg bg-gray-50'>
              <h2 className='flex gap-2 items-center text-gray-800'><Lightbulb /><strong>Information</strong></h2>
              <p className='mt-3 text-gray-600 text-sm'>
              • Press <strong>Record</strong> for each question; each answer requires a new recording.<br />
• Recording automatically stops after one second of silence, or you can press <strong>Stop</strong>.<br />
• Navigate to <strong>Next Question</strong> after recording for a smooth flow.<br />
• Submit all answers at the end for feedback.<br />
• Plan responses for clarity and conciseness.
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-5 items-start -mt-20'>
            {webcamEnable ? (
              <div className="mt-[15px]">
                <Webcam
                  onUserMedia={() => setWebcamEnable(true)}
                  onUserMediaError={() => setWebcamEnable(false)}
                  style={{ height: 600, width: 600 }}
                  mirrored={true}
                />
              </div>
            ) : (
              <>
                <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                <Button
                  className='w-full hover:bg-gray-200'
                  variant='ghost'
                  onClick={handleEnableWebcamAndMic}
                >
                  Enable WebCam and Microphone
                </Button>
              </>
            )}
          </div>

        </div>
      </div>
      {interviewId && webcamEnable && (
        <div className="flex justify-end p-6 -mt-24">
          <Link href={`/dashboard/interview/${interviewId}/start`}>
            <Button>Start Interview</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Interview;
