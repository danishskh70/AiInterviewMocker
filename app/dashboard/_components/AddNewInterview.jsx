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
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');;
  const [jobDescription, setJobDescription] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter()

  useEffect(() => {
    setIsClient(true); // Ensures code only runs on the client
  }, []);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosition, jobDescription, jobExperience }),
      });

      if (!result.ok) throw new Error("Failed to generate questions");
      
      const questions = await result.json();
      const rawResponseString = JSON.stringify(questions.map(q => ({
        Question: q.question,
        Answer: q.answer
      })));

      const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonResponse: rawResponseString,
        jobPosition: jobPosition,
        jobDesc: jobDescription,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: format(new Date(), 'dd-MM-yyyy'),
      }).returning();

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
        className="p-10 border rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
        onClick={() => setOpenDailog(true)}
      >
        <h2 className="text-lg text-center">+ Add new</h2>
      </div>
      <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about the job Interview</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add details about the job position, description, and years of experience.
            </DialogDescription>
            <div>
              <form onSubmit={onSubmit}>
                <div className="mt-7 my-3">
                  <label className="block text-sm font-medium mb-1">Job Role / Job Position</label>
                  <Input
                    placeholder="Ex. Full Stack Developer"
                    required
                    value={jobPosition}
                    onChange={(event) => setJobPosition(event.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label className="block text-sm font-medium mb-1">Job Description / Tech Stack</label>
                  <Textarea
                    placeholder="Ex. React, Angular, Node.js, SQL"
                    required
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <Input
                    type="number"
                    placeholder="Ex. 5"
                    max="100"
                    required
                    value={jobExperience}
                    onChange={(event) => setJobExperience(event.target.value)}
                  />
                </div>
                <div className="flex gap-5 justify-end mt-6">
                  <Button type="button" variant="ghost" onClick={() => setOpenDailog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" /> Generating...
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default AddNewInterview;
