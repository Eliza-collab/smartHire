import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, Sparkles, Loader2, Award } from "lucide-react";
import { CandidateEvaluation } from "../types";

interface InterviewChatbotModalProps {
  candidate: CandidateEvaluation | null;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export const InterviewChatbotModal: React.FC<InterviewChatbotModalProps> = ({
  candidate,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (candidate) {
      setMessages([
        {
          id: "m-init",
          sender: "bot",
          text: `Hello ${candidate.name}! I am the SmartHire AI Interview Screener. We've reviewed your resume for the ${candidate.headline} position, scoring a strong ${candidate.overallScore}/100. To start, could you walk me through a complex technical challenge you recently solved?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [candidate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!candidate) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/candidates/${candidate.id}/interview-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Thank you. How do you approach code quality and testing in this workflow?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: "Interesting perspective! Could you elaborate on your experience collaborating with cross-functional product teams?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full h-[620px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/80 flex items-center justify-center border border-indigo-400">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">SmartHire AI Interview Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Screening Candidate: <span className="font-semibold">{candidate.name}</span> ({candidate.overallScore}% Match)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  msg.sender === "user"
                    ? "bg-slate-800 text-white font-bold"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 mr-auto">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI is formulating interview follow-up...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your response as candidate (e.g. 'I led the migration of our monolith to microservices...')"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
