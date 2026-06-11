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
import { LoaderCircle, Plus, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GeneratingQuestionsUI } from "./GeneratingQuestionsUI";

const UI_MAPPING = {
  type: {
    TECHNICAL: "Technical Interview",
    BEHAVIORAL: "Behavioral Interview",
    HR: "HR/Screening Interview",
    MANAGERIAL: "Managerial Interview",
  },
  difficulty: {
    BEGINNER: "Entry Level",
    INTERMEDIATE: "Mid-Level",
    ADVANCED: "Senior/Lead",
    EXPERT: "Expert",
  },
  mode: {
    PRACTICE: "Practice Mode (With Hints)",
    EXAM: "Exam Mode (No Hints)",
    ADAPTIVE: "Adaptive",
  },
};

function AddNewInterview({ weakestCategory }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDesc: "",
    jobExperience: "",
    interviewType: "TECHNICAL",
    difficulty: "INTERMEDIATE",
    mode: "PRACTICE",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const suggestion = weakestCategory ? `${weakestCategory} Engineer` : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    
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
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const { interviewId } = await response.json();
      router.push(`/dashboard/interview/${interviewId}`);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const updateForm = (key, value) => {
    let processedValue = value;
    if (key === "jobPosition") {
      processedValue = toTitleCase(value);
    }
    setFormData((prev) => ({ ...prev, [key]: processedValue }));
  };

  return (
    <div>
      <div
        onClick={() => setOpenDialog(true)}
        className="flex flex-col items-center justify-center gap-2 p-8 bg-white border border-zinc-200 border-dashed rounded-xl cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors group"
      >
        <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
          <Plus className="h-5 w-5 text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-zinc-700">Add New Interview</p>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl bg-white border border-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Setup Mock Interview
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Fill out the details to create a mock interview tailored to your role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
            {loading ? (
              <GeneratingQuestionsUI />
            ) : (
              <>
                {suggestion && (
                  <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-sm text-amber-700">
                      Weakest area: <strong>{weakestCategory}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateForm("jobPosition", suggestion)}
                      className="ml-auto text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
                    >
                      Practice this
                    </button>
                  </div>
                )}
                <Input
                  placeholder="Job Position (e.g. Frontend Engineer)"
                  required
                  value={formData.jobPosition}
                  onChange={(e) => updateForm("jobPosition", e.target.value)}
                  className="border-zinc-300 focus:ring-zinc-900"
                />
                <Textarea
                  placeholder="Job Description"
                  required
                  value={formData.jobDesc}
                  onChange={(e) => updateForm("jobDesc", e.target.value)}
                  className="border-zinc-300 focus:ring-zinc-900 min-h-24 resize-none"
                />
                <Input
                  type="number"
                  placeholder="Years of Experience"
                  required
                  value={formData.jobExperience}
                  onChange={(e) => updateForm("jobExperience", e.target.value)}
                  className="border-zinc-300 focus:ring-zinc-900"
                />

                {/* Interview type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Type</label>
                  <Select
                    value={formData.interviewType}
                    onValueChange={(v) => updateForm("interviewType", v)}
                  >
                    <SelectTrigger className="border-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(UI_MAPPING.type).map((t) => (
                        <SelectItem key={t} value={t}>{UI_MAPPING.type[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Difficulty</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => updateForm("difficulty", v)}
                  >
                    <SelectTrigger className="border-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(UI_MAPPING.difficulty).map((d) => (
                        <SelectItem key={d} value={d}>{UI_MAPPING.difficulty[d]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Mode</label>
                  <Select
                    value={formData.mode}
                    onValueChange={(v) => updateForm("mode", v)}
                  >
                    <SelectTrigger className="border-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(UI_MAPPING.mode).map((m) => (
                        <SelectItem key={m} value={m}>{UI_MAPPING.mode[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                >
                  Create Interview
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;