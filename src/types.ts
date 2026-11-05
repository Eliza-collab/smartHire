export interface CandidateEvaluation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  overallScore: number; // 0-100
  breakdown: {
    skillsMatch: number; // 0-100
    experienceRelevance: number; // 0-100
    educationScore: number; // 0-100
    communicationQuality: number; // 0-100
  };
  extractedSkills: string[];
  missingSkills: string[];
  yearsExperience: number;
  education: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  risks: string[];
  recommendation: 'STRONG_MATCH' | 'POTENTIAL' | 'NEEDS_REVIEW' | 'NOT_RECOMMENDED';
  personalizedCandidateFeedback: string;
  rawTextPreview?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  description: string;
  weighting: {
    skills: number; // e.g. 40%
    experience: number; // e.g. 35%
    education: number; // e.g. 15%
    communication: number; // e.g. 10%
  };
}
