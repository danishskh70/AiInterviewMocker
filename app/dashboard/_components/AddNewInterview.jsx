"use client";
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function AddNewInterview({ weakestCategory }) {
  const [openDailog, setOpenDailog] = useState(false);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDesc: "",
    jobExperience: "",
    interviewType: "BEHAVIORAL",
    difficulty: "INTERMEDIATE",
    mode: "PRACTICE",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const suggestion = weakestCategory ? `${weakestCategory} Engineer` : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    setLoading(true);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response status:", response.status);
        console.error("Response body:", errorText);
        throw new Error(`Failed to generate interview: ${response.status}`);
      }

      const { interviewId } = await response.json();
      router.push(`/dashboard/interview/${interviewId}`);
      setOpenDailog(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

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
            <DialogTitle>Setup your Mock Interview</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new mock interview tailored to your role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {suggestion && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <span className="text-amber-700">
                  Weakest area: <strong>{weakestCategory}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => updateForm("jobPosition", suggestion)}
                  className="ml-auto text-xs text-primary underline"
                >
                  Practice this
                </button>
              </div>
            )}
            <Input
              placeholder="Job Position"
              required
              value={formData.jobPosition}
              onChange={(e) => updateForm("jobPosition", e.target.value)}
            />
            <Textarea
              placeholder="Job Description"
              required
              value={formData.jobDesc}
              onChange={(e) => updateForm("jobDesc", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Years of Experience"
              required
              value={formData.jobExperience}
              onChange={(e) => updateForm("jobExperience", e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4">
              <Select
                value={formData.interviewType}
                onValueChange={(v) => updateForm("interviewType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "REACT",
                    "NODEJS",
                    "SQL",
                    "SYSTEM_DESIGN",
                    "JAVA",
                    "BEHAVIORAL",
                    "HR",
                    "FULL_STACK",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.difficulty}
                onValueChange={(v) => updateForm("difficulty", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map(
                    (d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={formData.mode}
                onValueChange={(v) => updateForm("mode", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["PRACTICE", "EXAM", "ADAPTIVE"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" /> Creating...
                </>
              ) : (
                "Create Interview"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
