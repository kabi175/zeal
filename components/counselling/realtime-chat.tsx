"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Message, Session, MessageSender } from "@/types/app";

interface RealtimeChatProps {
  session: Session;
  userId: string;
  userRole: "student" | "expert";
}

export function RealtimeChat({ session, userId, userRole }: RealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    };
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`session:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== userId) {
          setPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id, userId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const broadcastTyping = useCallback(async () => {
    const channel = supabase.channel(`session:${session.id}`);
    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
  }, [session.id, userId, supabase]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await supabase.from("messages").insert({
      session_id: session.id,
      sender_id: userId,
      sender_type: userRole as MessageSender,
      content,
    });

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    broadcastTyping();
  };

  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden"
      style={{
        borderColor: "var(--border)",
        background: "var(--card)",
        height: "calc(100vh - 200px)",
        minHeight: 400,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: "oklch(0.55 0.18 145)" }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {session.title ?? "Counselling Session"}
        </p>
        <span className="text-xs ml-auto" style={{ color: "var(--muted-foreground)" }}>
          {format(new Date(session.scheduled_at), "MMM d · h:mm a")}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {msg.sender_type === "ai" ? "AI" : isOwn ? "Me" : "C"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                  style={{
                    background: isOwn ? "var(--primary)" : "var(--muted)",
                    color: isOwn ? "white" : "var(--foreground)",
                  }}
                >
                  <p>{msg.content}</p>
                  <p
                    className="text-[10px] mt-0.5 opacity-70"
                  >
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {partnerTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">C</AvatarFallback>
            </Avatar>
            <div
              className="rounded-2xl px-3 py-2 text-xs flex gap-1"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 p-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={sending}
          className="flex-1"
        />
        <Button
          variant="gradient"
          size="icon"
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
