import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react";
import { JobDescription, CandidateEvaluation } from "../types";

interface ResumeUploaderProps {
  jobs: JobDescription[];
  selectedJobId: string;
  onJobSelect: (jobId: string) => void;
  onUploadSuccess: (candidate: CandidateEvaluation) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  jobs,
  selectedJobId,
  onJobSelect,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a PDF document (.pdf).");
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller PDF.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleProcessUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setProcessingStep("Reading & parsing PDF document...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("Extracting candidate skills, experience & education...");
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep("AI matching against job criteria & calculating weighted score...");

      const formData = new FormData();
      formData.append("cv", selectedFile);
      formData.append("jobId", selectedJobId);

      const response = await fetch("/api/candidates/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Upload failed with status ${response.status}`);
      }

      setProcessingStep("Finalizing recruiter reasoning & personalized candidate feedback...");
      const result = await response.json();

      onUploadSuccess(result.candidate);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Sample quick upload helper for instant hackathon testing
  const handleQuickDemoResume = async (title: string, resumeContent: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      setProcessingStep(`Simulating upload for "${title}"...`);
      // Create a dummy text/pdf blob
      const blob = new Blob([resumeContent], { type: "application/pdf" });
      const mockFile = new File([blob], `${title.replace(/\s+/g, "_")}_CV.pdf`, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("cv", mockFile);
      formData.append("jobId", selectedJobId);

      setProcessingStep("Running Gemini 3.8 Flash evaluation...");
      const response = await fetch("/api/candidates/upload-cv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.candidate) {
        onUploadSuccess(result.candidate);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to run demo candidate");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Smart Resume Screening
            </span>
            <span className="text-xs text-slate-400 font-medium">Step 1 of 2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Upload & Screen Candidate CV</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a candidate PDF resume to extract skills, calculate match score (0–100), and evaluate candidate fit.
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
            Target Job:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => onJobSelect(e.target.value)}
            disabled={isProcessing}
            className="text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Job Quick Snapshot */}
      {selectedJob && (
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Required Skills:</span>
            {selectedJob.requiredSkills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Min Exp: <strong className="text-slate-800">{selectedJob.minExperienceYears}+ yrs</strong></span>
            <span>Weighting: Skills ({selectedJob.weighting.skills}%) · Exp ({selectedJob.weighting.experience}%)</span>
          </div>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`mt-4 relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.005]"
            : selectedFile
            ? "border-emerald-300 bg-emerald-50/20"
            : "border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
          id="resume-file-input"
        />

        {isProcessing ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center" />
              <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-4">AI Analysis in Progress...</h3>
            <p className="text-sm text-indigo-600 font-medium mt-1 flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              {processingStep || "Parsing document..."}
            </p>
            <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Gemini 3.8 Flash is scoring candidates against the job matrix
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-white rounded-xl border border-emerald-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PDF Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze against {selectedJob.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleProcessUpload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Analyze & Score with AI
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Drag and drop candidate resume here, or{" "}
              <label
                htmlFor="resume-file-input"
                className="text-indigo-600 hover:text-indigo-700 underline font-semibold cursor-pointer"
              >
                browse files
              </label>
            </h4>
            <p className="text-xs text-slate-500 mt-1.5">
              Supports PDF format up to 10MB. Text will be parsed and evaluated using Gemini 3.8 Flash.
            </p>

            {/* Quick Demo Pre-load buttons for Hackathon demo convenience */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-1">Or test with demo resumes:</span>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoResume(
                    "Sarah_Chen_FullStack",
                    `Sarah Chen\nEmail: sarah.chen@techmail.dev\nPhone: +1 415 555 8899\nHeadline: Senior Full Stack Developer (7 Years)\nSummary: Senior engineer specializing in high scale React 19, TypeScript, and Node.js microservices. Architected systems serving 10M+ MAUs.\nSkills: React, TypeScript, Node.js, Express, REST APIs, SQL, Docker, Tailwind CSS, PostgreSQL, GCP.\nExperience: 7 years as Senior Software Engineer at FinCloud Corp and Lead Frontend at AlphaLabs.\nEducation: M.S. Computer Science, Stanford University.`
                  )
                }
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition"
              >
                ⚡ Sarah Chen (High Match)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoResume(
                    "Marcus_Vance_PythonAI",
                    `Marcus Vance\nEmail: marcus.vance@ai-labs.org\nPhone: +1 650 444 3210\nHeadline: AI Solutions & Machine Learning Engineer\nSummary: 4 years designing NLP pipelines, RAG frameworks, and LLM integrations. Deep familiarity with Python, Gemini API, and TypeScript wrappers.\nSkills: Python, Gemini API / LLMs, Prompt Engineering, NLP, TypeScript / Node, Docker, Vector DBs, FastAPI.\nExperience: AI Engineer at Synthetix AI for 4 years.\nEducation: B.S. in Artificial Intelligence, Carnegie Mellon University.`
                  )
                }
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition"
              >
                ⚡ Marcus Vance (AI Engineer)
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
