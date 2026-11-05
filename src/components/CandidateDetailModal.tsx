import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  GraduationCap, 
  Briefcase, 
  Award, 
  FileText, 
  Share2,
  Copy,
  MessageSquare
} from "lucide-react";
import { CandidateEvaluation } from "../types";

interface CandidateDetailModalProps {
  candidate: CandidateEvaluation | null;
  onClose: () => void;
  onStartInterview: (candidate: CandidateEvaluation) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onStartInterview,
}) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "feedback" | "raw">("analysis");
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  if (!candidate) return null;

  const handleCopyFeedback = () => {
    navigator.clipboard.writeText(candidate.personalizedCandidateFeedback);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-200">
              {candidate.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700">
                  {candidate.overallScore}/100 Match
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{candidate.headline}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{candidate.email}</span>
                {candidate.phone && <span>· {candidate.phone}</span>}
                <span>· {candidate.fileName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 bg-white text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`py-3 border-b-2 transition ${
              activeTab === "analysis"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            AI Recruiter Reasoning & Score
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`py-3 border-b-2 transition ${
              activeTab === "feedback"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Personalized Candidate Feedback Loop
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`py-3 border-b-2 transition ${
              activeTab === "raw"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Parsed Resume Text
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "analysis" && (
            <>
              {/* Score breakdown metrics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Weighted Score Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <span className="text-xs text-indigo-600 font-semibold">Skills Match</span>
                    <p className="text-xl font-bold text-indigo-900 mt-1">{candidate.breakdown.skillsMatch}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="text-xs text-blue-600 font-semibold">Experience Fit</span>
                    <p className="text-xl font-bold text-blue-900 mt-1">{candidate.breakdown.experienceRelevance}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-xs text-emerald-600 font-semibold">Education & Academics</span>
                    <p className="text-xl font-bold text-emerald-900 mt-1">{candidate.breakdown.educationScore}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                    <span className="text-xs text-purple-600 font-semibold">Presentation Quality</span>
                    <p className="text-xl font-bold text-purple-900 mt-1">{candidate.breakdown.communicationQuality}%</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                  <Sparkles className="w-4 h-4" />
                  Executive AI Summary
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{candidate.summary}</p>
              </div>

              {/* Skills Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Extracted Technical & Domain Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths Identified
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-900">
                    {candidate.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Identified Gaps & Missing Competencies
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {candidate.gaps.length > 0 ? (
                      candidate.gaps.map((gap, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">No major gaps detected for this role level.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Education & Experience info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-500">Relevant Experience</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {candidate.yearsExperience} Years in software & technology
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-500">Academic Background</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {candidate.education}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h5 className="text-sm font-bold text-indigo-900">Candidate Transparency Report</h5>
                  </div>
                  <button
                    onClick={handleCopyFeedback}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 shadow-2xs transition"
                  >
                    {copiedFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFeedback ? "Copied!" : "Copy Report"}</span>
                  </button>
                </div>
                <p className="text-xs text-indigo-700/80 mt-1">
                  Core Innovation from PDF: Candidates receive a personalized report explaining their score and constructive tips.
                </p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line shadow-xs">
                {candidate.personalizedCandidateFeedback}
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Raw text extracted from {candidate.fileName} via server-side pdf-parse:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 whitespace-pre-wrap">
                {candidate.rawTextPreview || "No text available."}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartInterview(candidate);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <MessageSquare className="w-4 h-4" />
              Launch AI Interview Chatbot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
