"use client";

import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import { sendAIMessage } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! I'm your LifeOS assistant. I can help you plan your day, organize tasks, build habits, and stay productive.",
  },
];

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!isLoading && input.trim()) {
        void handleSubmit();
      }
    }
  }

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    setInput("");
    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendAIMessage(message);

      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: "assistant",
        content: response.content,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col">
      {/* Header */}
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Sparkles className="size-5" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal productivity copilot
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="size-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    isUser
                      ? "bg-foreground text-background"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {isUser && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="size-4" />
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t bg-background px-4 py-4 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
        >
          <div className="flex min-h-12 flex-1 items-end rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask LifeOS anything..."
              rows={1}
              disabled={isLoading}
              className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-3xl px-1 text-xs text-muted-foreground">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}