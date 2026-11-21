"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageCircle, X, Send, Bot, User, Sparkles,
  ThumbsUp, ThumbsDown, ChevronRight, Loader2
} from "lucide-react";
import { chatbotFAQs } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
  timestamp: Date;
}

function findAnswer(input: string): { answer: string; source: string } | null {
  const query = input.toLowerCase();
  for (const faq of chatbotFAQs) {
    for (const keyword of faq.keywords) {
      if (query.includes(keyword.toLowerCase())) {
        return { answer: faq.answer, source: faq.source };
      }
    }
  }
  // Check for partial word matches
  const words = query.split(/\s+/);
  for (const faq of chatbotFAQs) {
    let matchCount = 0;
    for (const keyword of faq.keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      for (const kw of kwWords) {
        if (words.some((w) => w.includes(kw) || kw.includes(w))) {
          matchCount++;
        }
      }
    }
    if (matchCount >= 2) {
      return { answer: faq.answer, source: faq.source };
    }
  }
  return null;
}

const suggestedPrompts = [
  "What is the Contributory Pension Scheme?",
  "How do I open an RSA?",
  "How can I transfer my RSA?",
  "What is Pension Clearance Certificate?",
  "How do I access my pension?",
  "What is Personal Pension Plan?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm PenCom's AI Digital Assistant. I can help you with questions about pension services, RSA transfers, the Contributory Pension Scheme, and more. How can I assist you today?",
      source: "PenCom AI Assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 100);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      window.setTimeout(() => document.getElementById("chat-trigger")?.focus(), 50);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSend = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const result = findAnswer(userText);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: result
        ? result.answer
        : "I don't have specific information on that topic yet. For detailed assistance, please contact PenCom directly at info@pencom.gov.ng or visit our FAQ page for more comprehensive answers.",
      source: result ? result.source : "PenCom General Knowledge",
      timestamp: new Date(),
    };

    setTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ y: reduce ? 0 : 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : 16, opacity: 0 }}
            id="chat-trigger"
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-4 z-50 flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#0A4A13] px-4 text-white shadow-[0_16px_36px_-14px_rgba(10,74,19,0.9)] ring-2 ring-white transition hover:bg-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D] sm:right-6 sm:pr-5 print:hidden"
            aria-label="Open AI Chat Assistant"
          >
            <MessageCircle className="h-6 w-6 text-[#F4D27A]" aria-hidden="true" />
            <span className="hidden text-base font-semibold sm:inline" aria-hidden="true">Ask PenCom</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="PenCom AI Assistant"
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 right-4 z-50 flex h-[600px] max-h-[calc(100svh-6.5rem)] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl bg-white text-[#14261A] shadow-[0_30px_70px_-20px_rgba(10,74,19,0.55)] ring-1 ring-black/10 sm:bottom-6 sm:right-6"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-[#FBF8F1] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A4A13]">
                  <Bot className="h-5 w-5 text-[#F4D27A]" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-tight">PenCom AI Assistant</div>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Sparkles className="h-3.5 w-3.5 text-[#7A5200]" aria-hidden="true" />
                    AI-Powered
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.setTimeout(() => document.getElementById("chat-trigger")?.focus(), 50);
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-base font-semibold text-[#14261A] ring-1 ring-black/15 transition hover:bg-[#0A4A13] hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span aria-hidden="true">Close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      msg.role === "assistant"
                        ? "bg-[#0A4A13]"
                        : "bg-[#F1EFE8]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
                    ) : (
                      <User className="h-4 w-4 text-gray-700" aria-hidden="true" />
                    )}
                  </div>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
                      msg.role === "assistant"
                        ? "rounded-tl-md bg-[#FBF8F1] text-[#14261A] ring-1 ring-black/10"
                        : "rounded-tr-md bg-[#0A4A13] text-white"
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.source && msg.role === "assistant" && (
                      <div className="mt-2 border-t border-black/10 pt-2">
                        <span className="text-sm text-gray-600">
                          Source: {msg.source}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-[#E8F5E9] hover:text-[#117F21] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]" aria-label="Helpful">
                            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-[#FCEBEB] hover:text-[#A32D2D] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]" aria-label="Not helpful">
                            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A4A13]">
                    <Bot className="h-4 w-4 text-[#F4D27A]" aria-hidden="true" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-[#FBF8F1] px-4 py-3 ring-1 ring-black/10">
                    <Loader2 className="w-4 h-4 text-[#117F21] animate-spin" />
                  </div>
                </motion.div>
              )}

              {/* Suggested prompts - only show for welcome */}
              {messages.length === 1 && !typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-2"
                >
                  <p className="mb-2 text-base font-semibold text-[#14261A]">Suggested questions:</p>
                  <div className="flex flex-col gap-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="group flex min-h-11 items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2 text-left text-base text-[#14261A] ring-1 ring-[#117F21]/30 transition-colors hover:bg-[#0A4A13] hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFD84D]"
                      >
                        {prompt}
                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-black/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about pension services..."
                  aria-label="Ask about pension services..."
                  className="min-h-12 min-w-0 flex-1 rounded-2xl bg-white px-4 text-base ring-1 ring-black/15 placeholder:text-gray-500 focus:outline-none focus:ring-[3px] focus:ring-[#FFD84D]"
                  disabled={typing}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || typing}
                  type="button"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4D27A] text-[#1A1206] transition-colors hover:bg-[#FFE08F] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFD84D]"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-2 text-center text-sm text-gray-600">
                PenCom AI Assistant - Informational purposes only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
