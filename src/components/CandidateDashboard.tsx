import React, { useState } from "react";
import { 
  Trophy, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Filter
} from "lucide-react";
import { CandidateEvaluation } from "../types";

interface CandidateDashboardProps {
  candidates: CandidateEvaluation[];
  onSelectCandidate: (candidate: CandidateEvaluation) => void;
  onOpenInterviewChat: (candidate: CandidateEvaluation) => void;
  onDeleteCandidate: (id: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  candidates,
  onSelectCandidate,
  onOpenInterviewChat,
  onDeleteCandidate,
}) => {
  const [anonymizeView, setAnonymizeView] = useState(false);
  const [filterRecommendation, setFilterRecommendation] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"score" | "exp" | "skills">("score");

  // Summary Metrics
  const totalCandidates = candidates.length;
  const avgScore = totalCandidates
    ? Math.round(candidates.reduce((sum, c) => sum + c.overallScore, 0) / totalCandidates)
    : 0;
  const topMatches = candidates.filter((c) => c.overallScore >= 85).length;
  const needReview = candidates.filter((c) => c.overallScore < 70).length;

  // Filter & Sort
  const filteredCandidates = candidates
    .filter((c) => {
      if (filterRecommendation !== "ALL" && c.recommendation !== filterRecommendation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = c.name.toLowerCase().includes(q);
        const skillMatch = c.extractedSkills.some((s) => s.toLowerCase().includes(q));
        const roleMatch = c.headline?.toLowerCase().includes(q);
        return nameMatch || skillMatch || roleMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === "score") return b.overallScore - a.overallScore;
      if (sortField === "exp") return b.yearsExperience - a.yearsExperience;
      if (sortField === "skills") return b.breakdown.skillsMatch - a.breakdown.skillsMatch;
      return 0;
    });

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (score >= 75) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    if (score >= 60) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  const getRecommendationBadge = (rec: CandidateEvaluation["recommendation"]) => {
    switch (rec) {
      case "STRONG_MATCH":
        return { label: "Top Shortlist", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "POTENTIAL":
        return { label: "Strong Potential", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "NEEDS_REVIEW":
        return { label: "Needs Review", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: "Not Matched", color: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Screened
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCandidates}</span>
            <span className="text-xs text-slate-500">Resumes parsed</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Ranked with Gemini 3.8 Flash</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Match Score
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, avgScore)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Tier Matches
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{topMatches}</span>
            <span className="text-xs text-slate-500">Score &ge; 85%</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High hiring confidence
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bias & Fairness Shield
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-purple-700">Blind Screening</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Toggle anonymization to hide names & photos and evaluate purely on skills.
          </p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search candidates by name, headline, or skill (e.g. React, SQL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recommendation Filter */}
          <select
            value={filterRecommendation}
            onChange={(e) => setFilterRecommendation(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories ({candidates.length})</option>
            <option value="STRONG_MATCH">Top Shortlist</option>
            <option value="POTENTIAL">Strong Potential</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-slate-400 font-medium px-1.5">Sort:</span>
            <button
              onClick={() => setSortField("score")}
              className={`px-2 py-0.5 rounded font-medium transition ${
                sortField === "score" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Score
            </button>
            <button
              onClick={() => setSortField("exp")}
              className={`px-2 py-0.5 rounded font-medium transition ${
                sortField === "exp" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Years
            </button>
            <button
              onClick={() => setSortField("skills")}
              className={`px-2 py-0.5 rounded font-medium transition ${
                sortField === "skills" ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Skills Match
            </button>
          </div>

          {/* Blind Screening Toggle (Core Innovation Feature from PDF) */}
          <button
            type="button"
            onClick={() => setAnonymizeView(!anonymizeView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              anonymizeView
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Hide candidate names to eliminate unconscious demographic bias"
          >
            {anonymizeView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{anonymizeView ? "Anonymized Active" : "Anonymize View"}</span>
          </button>
        </div>
      </div>

      {/* 3. Candidate Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Ranked Candidate Leaderboard</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredCandidates.length} Candidates
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Ranked descending by AI composite score
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No candidates match your filters</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or upload more resumes using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Candidate Profile</th>
                  <th className="py-3 px-4 text-center">Match Score</th>
                  <th className="py-3 px-4">Skills Matrix</th>
                  <th className="py-3 px-4">Experience & Edu</th>
                  <th className="py-3 px-4">Status & Recommendation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((candidate, idx) => {
                  const rec = getRecommendationBadge(candidate.recommendation);
                  const isTopRanked = idx === 0;

                  return (
                    <tr
                      key={candidate.id}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                      onClick={() => onSelectCandidate(candidate)}
                    >
                      {/* Rank Indicator */}
                      <td className="py-4 px-4 text-center font-bold">
                        {isTopRanked ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-xs shadow-xs">
                            #1
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold">#{idx + 1}</span>
                        )}
                      </td>

                      {/* Candidate Name / Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              anonymizeView
                                ? "bg-purple-100 text-purple-700"
                                : isTopRanked
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {anonymizeView
                              ? `C${idx + 1}`
                              : candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                              {anonymizeView ? `Candidate #${idx + 1}` : candidate.name}
                              {isTopRanked && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                  Top Pick
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">
                              {candidate.headline || "Applicant"}
                            </p>
                            {!anonymizeView && (
                              <p className="text-[11px] text-slate-400">{candidate.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Composite Score Circle & Bar */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl font-extrabold text-sm border shadow-2xs ${getScoreBadge(
                              candidate.overallScore
                            )}`}
                          >
                            {candidate.overallScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium">
                            Skills: {candidate.breakdown.skillsMatch}%
                          </span>
                        </div>
                      </td>

                      {/* Top Skills Tags */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                          {candidate.extractedSkills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.extractedSkills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-400 font-semibold">
                              +{candidate.extractedSkills.length - 4} more
                            </span>
                          )}
                        </div>
                        {candidate.missingSkills.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-600">
                            <span className="font-semibold">Missing:</span>
                            <span className="truncate max-w-[180px]">
                              {candidate.missingSkills.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Experience and Degree */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">
                            {candidate.yearsExperience} yrs exp
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {candidate.education}
                          </p>
                        </div>
                      </td>

                      {/* Recommendation Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${rec.color}`}
                        >
                          {rec.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onOpenInterviewChat(candidate)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition"
                            title="Start AI Mock Technical Screening"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(candidate)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                            title="View Full AI Breakdown & Reasoning"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
