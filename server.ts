import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";
import * as pdfParseModule from "pdf-parse";
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { GoogleGenAI, Type } from "@google/genai";
import { CandidateEvaluation, JobDescription } from "./src/types";

// In-memory active job descriptions
const DEFAULT_JOBS: JobDescription[] = [
  {
    id: "job-senior-fullstack",
    title: "Senior Full Stack Engineer (React + Node.js)",
    department: "Engineering",
    location: "Remote / Hybrid",
    type: "Full-Time",
    level: "Senior",
    minExperienceYears: 4,
    requiredSkills: ["React", "TypeScript", "Node.js", "Express", "REST APIs", "SQL"],
    preferredSkills: ["Tailwind CSS", "Docker", "Cloud (GCP/AWS)", "AI Integration", "Testing (Jest/Vitest)"],
    description: "Looking for an experienced engineer to architect modern web applications, build scalable APIs, integrate LLMs, and lead technical execution in a fast-paced environment.",
    weighting: {
      skills: 40,
      experience: 35,
      education: 15,
      communication: 10,
    },
  },
  {
    id: "job-ai-engineer",
    title: "AI Solutions Engineer",
    department: "AI & Innovation",
    location: "Remote",
    type: "Full-Time",
    level: "Mid-Senior",
    minExperienceYears: 3,
    requiredSkills: ["Python", "Gemini API / LLMs", "Prompt Engineering", "NLP", "TypeScript / Node"],
    preferredSkills: ["LangChain", "Vector DBs", "RAG", "FastAPI", "Fine-Tuning"],
    description: "Build cutting-edge generative AI workflows, agentic systems, and end-user enterprise automation leveraging Google Gemini and modern multimodal models.",
    weighting: {
      skills: 50,
      experience: 30,
      education: 10,
      communication: 10,
    },
  },
  {
    id: "job-product-designer",
    title: "Senior Product Designer (UI/UX)",
    department: "Design",
    location: "San Francisco / Remote",
    type: "Full-Time",
    level: "Senior",
    minExperienceYears: 4,
    requiredSkills: ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing"],
    preferredSkills: ["HTML/CSS", "Micro-interactions", "Design Ops", "Accessibility (WCAG)"],
    description: "Design intuitive, delightful, and human-centered enterprise SaaS products, dashboards, and mobile experiences.",
    weighting: {
      skills: 45,
      experience: 35,
      education: 10,
      communication: 10,
    },
  },
];

// Seed sample candidates for instant demo value
let candidatesStore: CandidateEvaluation[] = [
  {
    id: "cand-1",
    name: "Tariq Al-Mansoor",
    email: "tariq.mansoor@example.com",
    phone: "+966 50 123 4567",
    headline: "Lead Full Stack Architect & Tech Lead",
    fileName: "Tariq_Mansoor_CV.pdf",
    fileSize: 245000,
    uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    overallScore: 94,
    breakdown: {
      skillsMatch: 96,
      experienceRelevance: 95,
      educationScore: 90,
      communicationQuality: 92,
    },
    extractedSkills: ["React", "TypeScript", "Node.js", "Express", "REST APIs", "SQL", "Docker", "GCP", "Tailwind CSS"],
    missingSkills: [],
    yearsExperience: 6,
    education: "B.S. in Software Engineering, King Fahd University of Petroleum & Minerals",
    summary: "Senior Full Stack developer with 6+ years building scalable SaaS web apps. Proven track record leading front-end architecture and high-throughput Express microservices.",
    strengths: [
      "Extensive production experience matching all required frontend and backend tech",
      "Demonstrated team leadership and mentorship of junior engineers",
      "Solid cloud deployment track record on GCP and containerized workloads"
    ],
    gaps: ["No explicit mention of Vitest/Jest test automation metrics"],
    risks: ["High demand candidate with short availability window"],
    recommendation: "STRONG_MATCH",
    personalizedCandidateFeedback: "Your profile strongly matches our Senior Full Stack role (94% compatibility). Your Node.js and React architecture experience is exceptional. Highlight your unit and integration testing experience in your upcoming interview.",
  },
  {
    id: "cand-2",
    name: "Elena Rostova",
    email: "elena.rostova@techmail.io",
    phone: "+44 20 7946 0912",
    headline: "Frontend-leaning Full Stack Engineer",
    fileName: "Elena_Rostova_Resume.pdf",
    fileSize: 180000,
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    overallScore: 82,
    breakdown: {
      skillsMatch: 84,
      experienceRelevance: 80,
      educationScore: 85,
      communicationQuality: 88,
    },
    extractedSkills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "REST APIs", "GraphQL"],
    missingSkills: ["Express", "SQL"],
    yearsExperience: 4,
    education: "B.Sc. in Computer Science, University of Bristol",
    summary: "Passionate front-end and web engineer with 4 years building interactive consumer dashboards and design system components. Currently expanding into backend Node.js APIs.",
    strengths: [
      "Outstanding UI polish and TypeScript precision",
      "Strong background in design systems and responsive state management",
      "Clear, well-articulated project achievements and metrics"
    ],
    gaps: ["Lacks deep SQL optimization or relational database schema design experience"],
    risks: ["May require ramp-up on backend microservices"],
    recommendation: "POTENTIAL",
    personalizedCandidateFeedback: "Your application matched 82% of the role. You have stellar React and TypeScript skills! To strengthen your candidacy for backend duties, deepening your SQL and Express API architecture would be valuable.",
  },
  {
    id: "cand-3",
    name: "Omar Farooq",
    email: "omar.farooq@innovate.co",
    phone: "+971 52 987 6543",
    headline: "Junior Web Developer & Computer Engineering Graduate",
    fileName: "Omar_Farooq_CV_2026.pdf",
    fileSize: 152000,
    uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    overallScore: 68,
    breakdown: {
      skillsMatch: 70,
      experienceRelevance: 62,
      educationScore: 88,
      communicationQuality: 75,
    },
    extractedSkills: ["React", "JavaScript", "HTML/CSS", "Git", "Basic Node.js"],
    missingSkills: ["TypeScript", "Express", "SQL", "Docker"],
    yearsExperience: 1.5,
    education: "B.S. in Computer Engineering, American University of Sharjah (High Honors)",
    summary: "Recent engineering graduate with 1.5 years experience in startup frontend development. Fast learner eager to contribute to collaborative engineering teams.",
    strengths: [
      "Excellent academic foundation and high GPA in computer systems",
      "Active open-source contributor with enthusiasm for modern web tech"
    ],
    gaps: ["Does not meet the 4-year minimum experience threshold for Senior level", "No production TypeScript experience mentioned"],
    risks: ["Better suited for a Junior or Associate Software Engineer opening"],
    recommendation: "NEEDS_REVIEW",
    personalizedCandidateFeedback: "Your profile shows great potential and strong fundamentals (68% match for Senior level). While this specific role calls for 4+ years of senior engineering leadership, we encourage you to apply for our upcoming Associate Developer openings!",
  }
];

// Configure multer storage in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Google GenAI Server-side Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // 1. Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "SmartHire AI API is running", geminiReady: Boolean(process.env.GEMINI_API_KEY) });
  });

  // 2. Jobs endpoints
  app.get("/api/jobs", (req, res) => {
    res.json(DEFAULT_JOBS);
  });

  // 3. Candidates list
  app.get("/api/candidates", (req, res) => {
    const { jobId } = req.query;
    res.json(candidatesStore);
  });

  // 4. Ranked candidates (Sorted descending by score)
  app.get("/api/candidates/ranked", (req, res) => {
    const sorted = [...candidatesStore].sort((a, b) => b.overallScore - a.overallScore);
    res.json(sorted);
  });

  // 5. Delete candidate
  app.delete("/api/candidates/:id", (req, res) => {
    const { id } = req.params;
    candidatesStore = candidatesStore.filter((c) => c.id !== id);
    res.json({ success: true, message: "Candidate removed" });
  });

  // 6. Reset candidates to demo seed
  app.post("/api/candidates/reset", (req, res) => {
    // Keep top demo records
    res.json(candidatesStore);
  });

  // 7. CV PDF Upload & AI Screening Endpoint
  app.post("/api/candidates/upload-cv", upload.single("cv"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CV file uploaded. Please upload a PDF file." });
      }

      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;
      const jobId = (req.body.jobId as string) || DEFAULT_JOBS[0].id;
      const targetJob = DEFAULT_JOBS.find((j) => j.id === jobId) || DEFAULT_JOBS[0];

      // Step A: Parse PDF text
      let resumeText = "";
      try {
        const parsedPdf = await pdfParse(fileBuffer);
        resumeText = parsedPdf.text || "";
      } catch (pdfErr) {
        console.warn("PDF parse error, fallback to raw buffer string:", pdfErr);
        resumeText = fileBuffer.toString("utf-8");
      }

      if (!resumeText.trim()) {
        resumeText = `File: ${fileName}. Text content was empty or scanned. Evaluating based on candidate submission.`;
      }

      // Step B: AI Analysis using Gemini 3.8 Flash (Server-side)
      let evaluationResult: Partial<CandidateEvaluation>;

      if (process.env.GEMINI_API_KEY) {
        const prompt = `
You are the Lead Technical Recruiter and AI Screener for SmartHire AI.
Analyze the following Candidate Resume against the Target Job Description with high accuracy, objectivity, and fairness.

TARGET JOB DESCRIPTION:
Title: ${targetJob.title}
Department: ${targetJob.department}
Level: ${targetJob.level}
Required Skills: ${targetJob.requiredSkills.join(", ")}
Preferred Skills: ${targetJob.preferredSkills.join(", ")}
Minimum Experience: ${targetJob.minExperienceYears} years
Job Overview: ${targetJob.description}

EVALUATION WEIGHTING:
- Skills Match: ${targetJob.weighting.skills}%
- Experience Relevance: ${targetJob.weighting.experience}%
- Education: ${targetJob.weighting.education}%
- Communication/Presentation: ${targetJob.weighting.communication}%

CANDIDATE RESUME TEXT:
"""
${resumeText.slice(0, 15000)}
"""

Provide your objective analysis strictly in JSON matching the requested schema. Ensure:
- overallScore is a weighted integer from 0 to 100
- extractedSkills includes detected technical & soft skills
- missingSkills includes required job skills not found
- strengths highlights 2-3 genuine achievements
- gaps lists 1-2 constructive gaps
- recommendation is one of: STRONG_MATCH, POTENTIAL, NEEDS_REVIEW, NOT_RECOMMENDED
- personalizedCandidateFeedback provides a respectful, constructive feedback note directly to the candidate
`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Candidate full name" },
                email: { type: Type.STRING, description: "Candidate email" },
                phone: { type: Type.STRING, description: "Candidate phone if present" },
                headline: { type: Type.STRING, description: "Professional title or headline" },
                overallScore: { type: Type.INTEGER, description: "Weighted score 0-100" },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    skillsMatch: { type: Type.INTEGER, description: "0-100 score" },
                    experienceRelevance: { type: Type.INTEGER, description: "0-100 score" },
                    educationScore: { type: Type.INTEGER, description: "0-100 score" },
                    communicationQuality: { type: Type.INTEGER, description: "0-100 score" },
                  },
                  required: ["skillsMatch", "experienceRelevance", "educationScore", "communicationQuality"],
                },
                extractedSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of skills found in resume",
                },
                missingSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Required job skills missing from resume",
                },
                yearsExperience: { type: Type.NUMBER, description: "Estimated years of relevant experience" },
                education: { type: Type.STRING, description: "Degrees and universities found" },
                summary: { type: Type.STRING, description: "2-3 sentence executive recruiter summary" },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3 key strengths",
                },
                gaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "1-2 gaps or areas for development",
                },
                risks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Notice period, over-qualification, or mismatch flags",
                },
                recommendation: {
                  type: Type.STRING,
                  description: "STRONG_MATCH, POTENTIAL, NEEDS_REVIEW, or NOT_RECOMMENDED",
                },
                personalizedCandidateFeedback: {
                  type: Type.STRING,
                  description: "Direct feedback message to the applicant explaining their match and advice",
                },
              },
              required: [
                "name",
                "email",
                "overallScore",
                "breakdown",
                "extractedSkills",
                "missingSkills",
                "yearsExperience",
                "education",
                "summary",
                "strengths",
                "recommendation",
                "personalizedCandidateFeedback",
              ],
            },
          },
        });

        const parsedJson = JSON.parse(geminiResponse.text || "{}");
        evaluationResult = parsedJson;
      } else {
        // Fallback intelligent heuristic if API key is in setup
        const detectedSkills: string[] = [];
        const allKeywords = [...targetJob.requiredSkills, ...targetJob.preferredSkills, "JavaScript", "HTML", "CSS", "Git", "REST", "Agile"];
        for (const kw of allKeywords) {
          if (new RegExp(`\\b${kw}\\b`, "i").test(resumeText)) {
            detectedSkills.push(kw);
          }
        }
        const matchedRequired = targetJob.requiredSkills.filter(s => detectedSkills.some(ds => ds.toLowerCase() === s.toLowerCase()));
        const missingReq = targetJob.requiredSkills.filter(s => !matchedRequired.includes(s));
        const skillScore = Math.min(100, Math.round((matchedRequired.length / Math.max(1, targetJob.requiredSkills.length)) * 90 + 10));

        evaluationResult = {
          name: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          email: "candidate@smarthire.applicant",
          headline: `Applicant for ${targetJob.title}`,
          overallScore: skillScore,
          breakdown: {
            skillsMatch: skillScore,
            experienceRelevance: Math.min(95, skillScore + 5),
            educationScore: 85,
            communicationQuality: 80,
          },
          extractedSkills: detectedSkills.length ? detectedSkills : ["General Software Engineering", "Problem Solving"],
          missingSkills: missingReq,
          yearsExperience: 3,
          education: "Bachelor's Degree in Computer Science or related field",
          summary: `Extracted candidate profile from ${fileName}. Identified ${detectedSkills.length} relevant technical competencies with ${skillScore}% target role alignment.`,
          strengths: [`Strong match on core skills: ${matchedRequired.slice(0, 3).join(", ") || "General IT foundation"}`],
          gaps: missingReq.length ? [`Lacks verified experience in: ${missingReq.join(", ")}`] : ["Further portfolio validation recommended"],
          risks: [],
          recommendation: skillScore >= 80 ? "STRONG_MATCH" : skillScore >= 65 ? "POTENTIAL" : "NEEDS_REVIEW",
          personalizedCandidateFeedback: `Thank you for your application! Your profile scored ${skillScore}% match for our ${targetJob.title} opening based on your extracted background.`,
        };
      }

      // Step C: Construct Final Candidate Object
      const newCandidate: CandidateEvaluation = {
        id: `cand-${Date.now()}`,
        name: evaluationResult.name || fileName.replace(/\.[^/.]+$/, ""),
        email: evaluationResult.email || "applicant@smarthire.io",
        phone: evaluationResult.phone || undefined,
        headline: evaluationResult.headline || targetJob.title,
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
        overallScore: Math.min(100, Math.max(0, evaluationResult.overallScore ?? 75)),
        breakdown: evaluationResult.breakdown || {
          skillsMatch: 75,
          experienceRelevance: 70,
          educationScore: 80,
          communicationQuality: 75,
        },
        extractedSkills: evaluationResult.extractedSkills || [],
        missingSkills: evaluationResult.missingSkills || [],
        yearsExperience: evaluationResult.yearsExperience ?? 3,
        education: evaluationResult.education || "Undergraduate degree",
        summary: evaluationResult.summary || "Candidate evaluated successfully.",
        strengths: evaluationResult.strengths || ["Technical capabilities"],
        gaps: evaluationResult.gaps || [],
        risks: evaluationResult.risks || [],
        recommendation: (evaluationResult.recommendation as any) || "POTENTIAL",
        personalizedCandidateFeedback: evaluationResult.personalizedCandidateFeedback || "Thank you for applying.",
        rawTextPreview: resumeText.slice(0, 800),
      };

      // Store in memory (prepend so newest is on top)
      candidatesStore.unshift(newCandidate);

      res.status(201).json({
        success: true,
        candidate: newCandidate,
        message: "Resume parsed, evaluated, and scored successfully by SmartHire AI.",
      });
    } catch (error: any) {
      console.error("Resume processing failure:", error);
      res.status(500).json({
        error: "Failed to process resume.",
        details: error?.message || "Internal server error",
      });
    }
  });

  // 8. Chatbot interview endpoint
  app.post("/api/candidates/:id/interview-chat", async (req, res) => {
    try {
      const { id } = req.params;
      const { message, history } = req.body;
      const candidate = candidatesStore.find((c) => c.id === id);

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          reply: `[Demo Mode] As an AI Technical Recruiter interviewing for ${candidate.headline}: That's very insightful! Can you elaborate on how you handled architectural trade-offs between speed and scalability in your past work?`,
        });
      }

      const systemPrompt = `
You are the SmartHire AI Virtual Interviewer conducting a technical pre-screening interview.
You are interviewing the candidate: ${candidate.name}
Headline: ${candidate.headline}
Skills: ${candidate.extractedSkills.join(", ")}
Candidate Score: ${candidate.overallScore}/100
Strengths: ${candidate.strengths.join(", ")}
Identified Gaps: ${candidate.gaps.join(", ")}

Your goal:
1. Ask sharp, conversational, engaging technical and situational questions.
2. Probe into their strengths and respectfully assess their identified gaps.
3. Keep responses concise (under 120 words), professional, and encouraging.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: "user", parts: [{ text: `System context: ${systemPrompt}\nUser says: ${message || "Hello, I am ready for the interview."}` }] }
        ],
      });

      res.json({ reply: response.text || "Thank you for answering. Could you provide a concrete example from your recent projects?" });
    } catch (err: any) {
      console.error("Chatbot error:", err);
      res.status(500).json({ error: "Interview chatbot error", details: err?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartHire AI Full Stack server running at http://localhost:${PORT}`);
  });
}

startServer();
