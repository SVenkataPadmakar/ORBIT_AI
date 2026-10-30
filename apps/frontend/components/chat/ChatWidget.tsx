"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Square,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp?: number;
}

const STARTER_PROMPTS = [
  "💡 Validate my B2B AI SaaS startup idea",
  "🏗️ Recommend MVP architecture & database schema",
  "📊 Draft a 7-day customer discovery sprint",
  "💰 Calculate 12-month runway & key SaaS metrics",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  // Avoid SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll to bottom as chunks arrive
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(isStreaming ? "auto" : "smooth");
    }
  }, [messages, isStreaming, isOpen, scrollToBottom]);

  // Clean up ongoing stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Stop the active streaming response and clean up pending placeholders
   */
  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      isStreamingRef.current = false;
      // Remove empty placeholder model bubble if nothing was yielded
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "model" && !last.content.trim()) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  }, []);

  /**
   * Clears conversation history
   */
  const handleClearChat = useCallback(() => {
    handleStopStreaming();
    setMessages([]);
    setError(null);
  }, [handleStopStreaming]);

  /**
   * Primary fetch streaming function.
   * Uses TextDecoder and response.body.getReader() to stream tokens chunk-by-chunk.
   */
  const sendStreamingMessage = async (rawMessage?: string) => {
    const textToSend = (rawMessage ?? input).trim();
    if (!textToSend || isStreamingRef.current) return;

    // Concurrency guard: instantly lock stream invocation
    isStreamingRef.current = true;
    setIsStreaming(true);
    setError(null);

    const currentHistory = [...messages];
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `model-${Date.now() + 1}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };

    const aiMessagePlaceholder: ChatMessage = {
      id: aiMsgId,
      role: "model",
      content: "",
      timestamp: Date.now() + 1,
    };

    // 1. Add user's message immediately
    // 2. Add empty AI message bubble for streaming output
    setMessages((prev) => [...prev, userMessage, aiMessagePlaceholder]);
    setInput("");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Filter and sanitize history so it alternates roles cleanly (user -> model)
    const rawHistory = currentHistory
      .filter((item) => item.content && item.content.trim().length > 0)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    const sanitizedHistory: { role: "user" | "model"; content: string }[] = [];
    for (const item of rawHistory) {
      if (sanitizedHistory.length === 0) {
        if (item.role === "user") {
          sanitizedHistory.push(item);
        }
      } else {
        const lastItem = sanitizedHistory[sanitizedHistory.length - 1];
        if (lastItem && item.role !== lastItem.role) {
          sanitizedHistory.push(item);
        } else if (item.role === "user" && lastItem) {
          sanitizedHistory[sanitizedHistory.length - 1] = item;
        }
      }
    }
    // Must end with model turn so new message alternates properly as user
    const lastSanitized = sanitizedHistory[sanitizedHistory.length - 1];
    if (lastSanitized && lastSanitized.role === "user") {
      sanitizedHistory.pop();
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: sanitizedHistory,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const rawError = await response.text().catch(() => "Unknown error");
        let detailMsg = rawError;
        try {
          const parsed = JSON.parse(rawError);
          if (parsed.detail) {
            detailMsg = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
          }
        } catch {
          // Keep raw string
        }
        throw new Error(`Server returned ${response.status}: ${detailMsg}`);
      }

      if (!response.body) {
        throw new Error("No response body received from chat stream.");
      }

      // CRITICAL: Use a TextDecoder and response.body.getReader() to read the plain text stream chunk-by-chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      try {
        while (true) {
          if (abortController.signal.aborted) break;

          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Append the new text directly to the AI message bubble in the UI
          setMessages((prev) => {
            const targetIdx = prev.findIndex((m) => m.id === aiMsgId);
            const target = prev[targetIdx];
            if (targetIdx === -1 || !target) return prev;
            const updated = [...prev];
            updated[targetIdx] = {
              ...target,
              content: accumulatedText,
            };
            return updated;
          });
        }

        // Flush any lingering decoded characters
        if (!abortController.signal.aborted) {
          const remaining = decoder.decode();
          if (remaining) {
            accumulatedText += remaining;
            setMessages((prev) => {
              const targetIdx = prev.findIndex((m) => m.id === aiMsgId);
              const target = prev[targetIdx];
              if (targetIdx === -1 || !target) return prev;
              const updated = [...prev];
              updated[targetIdx] = {
                ...target,
                content: accumulatedText,
              };
              return updated;
            });
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Stream deliberately aborted by user
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "model" && !last.content.trim()) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        return;
      }
      const errMsg =
        err instanceof Error ? err.message : "Failed to connect to chat assistant.";
      setError(errMsg);

      // Populate AI bubble with error notice if nothing arrived
      setMessages((prev) => {
        const targetIdx = prev.findIndex((m) => m.id === aiMsgId);
        const target = prev[targetIdx];
        if (targetIdx !== -1 && target && !target.content) {
          const updated = [...prev];
          updated[targetIdx] = {
            ...target,
            content: `⚠️ **Chat Error:** ${errMsg}\n\nPlease verify that the backend API is running on \`http://localhost:8000\`.`,
          };
          return updated;
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
      isStreamingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStreamingRef.current) {
      sendStreamingMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!isStreamingRef.current) {
        sendStreamingMessage();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* ── Slide-up Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed bottom-24 right-4 sm:right-6 z-50",
              "w-[calc(100vw-2rem)] sm:w-[430px] h-[600px] max-h-[calc(100dvh-7.5rem)]",
              "flex flex-col rounded-2xl",
              "bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10",
              "shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden",
            )}
            aria-label="Orbit AI Chat Assistant"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_14px_rgba(124,92,255,0.4)]">
                  <Sparkles className="size-4.5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-white">
                      ORBIT Copilot
                    </h2>
                    <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                      Gemini 2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Realtime streaming startup advisor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>
            </div>

            {/* ── Messages History ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm select-text scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 px-2 space-y-4">
                  <div className="size-12 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(124,92,255,0.15)]">
                    <Bot className="size-6 text-violet-300" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h3 className="font-semibold text-white text-base">
                      How can I help your startup?
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Ask me to challenge assumptions, design schemas, refine business models, or structure sprints.
                    </p>
                  </div>

                  <div className="w-full space-y-2 pt-2 text-left">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block px-1">
                      Suggested prompts
                    </span>
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        disabled={isStreaming}
                        onClick={() => sendStreamingMessage(prompt)}
                        className="w-full text-left text-xs p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const isLast = idx === messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2.5 items-start",
                        isUser ? "justify-end" : "justify-start",
                      )}
                    >
                      {!isUser && (
                        <div className="size-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 text-violet-300">
                          <Bot className="size-4" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 max-w-[85%] text-xs sm:text-sm leading-relaxed",
                          isUser
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-md"
                            : "bg-white/[0.05] border border-white/10 text-zinc-100 rounded-bl-sm shadow-sm",
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        ) : !msg.content && isStreaming && isLast ? (
                          <div className="flex items-center gap-1.5 py-1 text-violet-400">
                            <span className="size-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="size-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="size-2 rounded-full bg-violet-400 animate-bounce" />
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-zinc-100 leading-relaxed font-sans prose-p:my-1 prose-headings:font-semibold prose-headings:text-white prose-ul:my-1.5 prose-li:my-0.5 prose-code:text-violet-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:my-2 prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-pre:p-2.5 prose-pre:rounded-lg">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {isStreaming && isLast && (
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-violet-400 animate-pulse align-middle" />
                            )}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="size-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 text-xs">
                  <AlertTriangle className="size-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-300">Stream Connection Error</p>
                    <p className="text-red-300/80 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-white/10 p-3 bg-white/[0.02]"
            >
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/40 p-2 focus-within:border-violet-500/50 transition-colors">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI copilot anything…"
                  className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-white outline-none placeholder:text-zinc-500"
                />

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
                    title="Stop generation"
                    aria-label="Stop generation"
                  >
                    <Square className="size-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:hover:bg-violet-600 transition-colors shadow-sm"
                    title="Send message (Enter)"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-500 font-mono">
                <span>Gemini 2.0 Flash</span>
                <span>Enter ↵ to send</span>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Floating Toggle Button ── */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex size-14 items-center justify-center rounded-full",
          "bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white",
          "shadow-[0_8px_30px_rgba(124,92,255,0.45)] border border-white/20",
          "hover:shadow-[0_12px_40px_rgba(124,92,255,0.65)]",
          "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        )}
        aria-label={isOpen ? "Close AI chat assistant" : "Open AI chat assistant"}
        title={isOpen ? "Close AI chat" : "Chat with AI Copilot"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="size-6 text-white" />
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-cyan-400 ring-2 ring-[#0A0A0F]" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
