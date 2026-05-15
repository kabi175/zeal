"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types/app";

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed with exams",
  "Help me with a breathing exercise",
  "I'm struggling to sleep",
  "How do I manage anxiety?",
];

interface AiChatProps {
  userId: string;
  userName: string;
}

export function AiChat({ userId, userName }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${userName}! I'm your AI Wellness Companion. I'm here to listen, support, and guide you. How are you feeling today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || streaming) return;
    setInput("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreaming(true);
    setStreamContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: content.trim() },
          ],
          userId,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamContent(fullContent);
      }

      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-err",
            role: "assistant",
            content: "I'm sorry, I encountered an issue. Please try again. If you need urgent support, contact our counselling team at zealcatalyst.zeca@gmail.com or call +91 97902 05149.",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setStreaming(false);
      setStreamContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: `Hi ${userName}! I'm here whenever you need me. How are you feeling?`,
      timestamp: new Date(),
    }]);
    setInput("");
    setStreaming(false);
    setStreamContent("");
  };

  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden"
      style={{
        borderColor: "var(--border)",
        background: "var(--card)",
        height: "calc(100vh - 220px)",
        minHeight: 500,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            AI Wellness Companion
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Always available · Not a substitute for professional care
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={clearConversation}
          title="Clear conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className="text-xs"
                  style={
                    msg.role === "assistant"
                      ? { background: "var(--primary)", color: "white" }
                      : {}
                  }
                >
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[80%] space-y-1 ${msg.role === "user" ? "items-end" : ""} flex flex-col`}>
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: msg.role === "user" ? "var(--primary)" : "var(--muted)",
                    color: msg.role === "user" ? "white" : "var(--foreground)",
                  }}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] px-1" style={{ color: "var(--muted-foreground)" }}>
                  {format(msg.timestamp, "h:mm a")}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Streaming bubble */}
          {streaming && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{ background: "var(--muted)", color: "var(--foreground)" }}
              >
                {streamContent || (
                  <span className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex gap-2 p-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type how you're feeling…"
          disabled={streaming}
          className="flex-1"
        />
        <Button
          variant="gradient"
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          aria-label="Send"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
