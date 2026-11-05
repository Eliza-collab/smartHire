import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Sparkles, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  RefreshCw, 
  Building2,
  CheckCircle,
  HelpCircle,
  Code2
} from "lucide-react";
import { CandidateEvaluation, JobDescription } from "./types";
import { ResumeUploader } from "./components/ResumeUploader";
import { CandidateDashboard } from "./components/CandidateDashboard";
import { CandidateDetailModal } from "./components/CandidateDetailModal";
import { InterviewChatbotModal } from "./components/InterviewChatbotModal";

export default function App() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateEvaluation | null>(null);
  const [interviewCandidate, setInterviewCandidate] = useState<CandidateEvaluation | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Fetch initial jobs and candidates from Express backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [jobsRes, candRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/candidates"),
        ]);
        const jobsData = await jobsRes.json();
        const candData = await candRes.json();

        setJobs(jobsData);
        if (jobsData.length > 0) {
          setSelectedJobId(jobsData[0].id);
        }
        setCandidates(candData);
      } catch (err) {
        console.error("Failed to load backend data:", err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadInitialData();
  }, []);

  const handleUploadSuccess = (newCandidate: CandidateEvaluation) => {
    setCandidates((prev) => [newCandidate, ...prev]);
    // Automatically preview the analyzed candidate
    setSelectedCandidate(newCandidate);
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  SmartHire <span className="text-indigo-600">AI</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Hackathon Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Autonomous Resume Screening & Candidate Ranking System
              </p>
            </div>
          </div>

          {/* Quick Feature Badges from Product Spec */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Bias & Fairness Controls</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Explainable AI Scores</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Announcement */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                Core Innovation
              </span>
              <h2 className="text-base font-bold">Smart Resume Screening + Candidate Feedback Loop</h2>
            </div>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
              Upload candidate CVs in PDF format. SmartHire extracts skills, evaluates against job requirements, 
              produces an objective score (0–100), and generates candidate transparency feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-indigo-100 font-mono">
              Engine: Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* 1. Resume File Upload Component with Visual Loading State */}
        <ResumeUploader
          jobs={jobs}
          selectedJobId={selectedJobId}
          onJobSelect={setSelectedJobId}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* 2. Candidate Dashboard with Ranking Table and Summary View */}
        <CandidateDashboard
          candidates={candidates}
          onSelectCandidate={setSelectedCandidate}
          onOpenInterviewChat={setInterviewCandidate}
          onDeleteCandidate={handleDeleteCandidate}
        />
      </main>

      {/* Candidate Deep-Dive Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onStartInterview={(cand) => setInterviewCandidate(cand)}
      />

      {/* AI Pre-Screening Interview Chatbot Modal */}
      <InterviewChatbotModal
        candidate={interviewCandidate}
        onClose={() => setInterviewCandidate(null)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            <strong>SmartHire AI</strong> — Built for Hackathon Demo Day. Combines Explainable AI, Fairness, and Recruiter Usability.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Node.js Express API</span>
            <span>•</span>
            <span>React SPA</span>
            <span>•</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
