"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";

function Interview({ params }) {
  const [interviewId, setInterviewId] = useState("");
  const [interviewdata, setInterviewdata] = useState({});
  const [webcamEnable, setWebcamEnable] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

  const GetInterviewDetails = async (id) => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, id));

    const data = result[0] || {};
    console.log('Setting interview data to:', data);
    setInterviewdata(data);
  };

  const handleEnableWebcamAndMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamEnable(true);
    } catch (err) {
      console.error("Access denied:", err);
      alert("Please allow camera and microphone access to continue.");
    }
  };

  return (
    <div className="my-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        Ready for your Mock Interview?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-[50%_50%] gap-10 mt-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 p-5 rounded-lg border">
            <h2 className="text-lg">
              <strong>Job Role/Job Position:</strong>{" "}
              {interviewdata.jobPosition || "Not Available"}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/Tech Stack:</strong>{" "}
              {interviewdata.jobDesc || "Not Available"}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience:</strong>{" "}
              {interviewdata.jobExperience || "Not Available"}
            </h2>
          </div>
          <div className="p-5 border rounded-lg bg-gray-50">
            <h2 className="flex gap-2 items-center text-gray-800">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <p className="mt-3 text-gray-600 text-sm">
              • Press <strong>Record</strong> for each question; each answer
              requires a new recording.
              <br />• Recording automatically stops after one second of silence,
              or you can press <strong>Stop</strong>.<br />• Navigate to{" "}
              <strong>Next Question</strong> after recording for a smooth flow.
              <br />
              • Submit all answers at the end for feedback.
              <br />• Plan responses for clarity and conciseness.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 items-center justify-between">
          {webcamEnable ? (
            <div className="w-full">
              <Webcam
                onUserMedia={() => setWebcamEnable(true)}
                onUserMediaError={() => setWebcamEnable(false)}
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                mirrored={true}
              />
            </div>
          ) : (
            <div className="w-full">
              <WebcamIcon className="h-72 w-full p-20 bg-secondary rounded-lg border" />
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={handleEnableWebcamAndMic}
              >
                Enable WebCam and Microphone
              </Button>
            </div>
          )}

          {interviewId && webcamEnable && (
            <div className="w-full flex justify-end">
              <Link href={`/dashboard/interview/${interviewId}/start`}>
                <Button>Start Interview</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;
