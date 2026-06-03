// DESIGN SYSTEM APPLIED
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
import { LoaderCircle, Plus, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function AddNewInterview({ weakestCategory }) {
  const [openDialog, setOpenDialog] = useState(false);
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

  const updateForm = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      {/* Trigger card */}
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

            {/* Weakest category suggestion */}
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

            <div className="grid grid-cols-3 gap-3">
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
                  <SelectContent>
                    {["REACT","NODEJS","SQL","SYSTEM_DESIGN","JAVA","BEHAVIORAL","HR","FULL_STACK"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
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
                  <SelectContent>
                    {["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
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
                  <SelectContent>
                    {["PRACTICE","EXAM","ADAPTIVE"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors mt-2"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Creating...
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