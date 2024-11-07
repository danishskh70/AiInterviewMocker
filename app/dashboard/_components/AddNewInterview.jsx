"use client";
import React, { useEffect, useState } from 'react';
import { MockInterview } from '../../../utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../utils/db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "../../../utils/GeminiAiModal";
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');;
  const [jobDescription, setJobDescription] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter()

  useEffect(() => {
    setIsClient(true); // Ensures code only runs on the client
  }, []);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!chatSession) {
      console.error("chatSession is not initialized.");
      setLoading(false);
      router.push('./dashboard/interview' + resp[0]?.mockId)
      return;
    }

    // Update the InputPrompt to request plain text without symbols
    const InputPrompt = `Job Position: ${jobPosition}, Description: ${jobDescription}, Experience: ${jobExperience} years. Please generate exactly 5 interview questions atleast with 4-5 lines in each question and answers in JSON format, where each question has a "Question" field and its corresponding answer has an "Answer" field. Ensure that response must not contains any symbols, special characters, or punctuation. Use only plain text in your response.`;

    const result = await chatSession.generateContent(InputPrompt);
    const rawResponse = await result.response.text();
    // Clean the response by removing backticks, triple backticks, and any unwanted characters
    const cleanedResponse = rawResponse
      .replace(/^```json\s*/i, '') // Remove starting ```json
      .replace(/\s*```$/, '') // Remove ending ```
      .trim(); // Trim any surrounding whitespace


    console.log(JSON.parse(cleanedResponse));
    setJsonResponse(cleanedResponse);


    try {
      const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonResponse: rawResponse,
        jobPosition: jobPosition,
        jobDesc: jobDescription,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy'),
      }).returning();


      console.log("Inserted ID:", resp);

      if (resp) {
        router.push(`/dashboard/interview/${resp[0]?.mockId}`);
        setOpenDailog(false);
      }

    } catch (error) {
      console.error("Error during operation:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDailog(true)}
      >
        <h2 className="text-lg text-center"> + Add new</h2>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about the job Interview</DialogTitle>
            <div className="text-sm text-muted-foreground">
              <div>
                <div className="mt-4 mb-2">
                  Add details about the job position, description, and years of experience
                </div>
                <form onSubmit={onSubmit}>
                  <div className="mt-7 my-3">
                    <label className="mt-7 my-2">Job Role / Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label className="mt-7 my-2">Job Description / Tech Stack</label>
                    <Textarea
                      placeholder="Ex. React, Angular, Node.js, SQL"
                      required
                      value={jobDescription}
                      onChange={(event) => setJobDescription(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label className="mt-7 my-2">Years of Experience</label>
                    <Input
                      type="number"
                      placeholder="Ex. 5"
                      max="100"
                      required
                      value={jobExperience}
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                  <div className="flex gap-5 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setOpenDailog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Generating from AI...
                        </>
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default AddNewInterview;
