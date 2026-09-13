"use client";

import {
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Conversation,
  getConversationMessages,
  getConversations,
  sendAIMessage,
} from "@/lib/api";

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>(starterMessages);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations();

        setConversations(data);

        if (data.length > 0) {
          setActiveConversationId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversations.",
        );
      } finally {
        setIsLoadingConversations(false);
      }
    }

    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages(starterMessages);
      return;
    }

    async function loadMessages() {
      setIsLoadingMessages(true);
      setError(null);

      try {
        const conversationId = activeConversationId;

        if (!conversationId) {
          return;
        }

        const data = await getConversationMessages(conversationId);

        setMessages(
          data.map((message) => ({
            id: message.id,
            role: message.role as "user" | "assistant",
            content: message.content,
          })),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversation.",
        );
      } finally {
        setIsLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function handleNewChat() {
    if (isLoading) {
      return;
    }

    setActiveConversationId(null);
    setMessages(starterMessages);
    setInput("");
    setError(null);

    textareaRef.current?.focus();
  }

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
      const response = await sendAIMessage(
        message,
        activeConversationId ?? undefined,
      );

      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: "assistant",
        content: response.content,
      };

      setMessages((current) => [...current, assistantMessage]);

      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id);
      }

      const updatedConversations = await getConversations();
      setConversations(updatedConversations);
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
    <div className="flex h-[calc(100vh-4rem)] min-h-0">
      {/* Conversation Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r md:flex md:flex-col">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              Conversations
            </h2>
            <p className="text-xs text-muted-foreground">
              Your AI chat history
            </p>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            disabled={isLoading}
            className="flex size-8 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="New chat"
            title="New chat"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isActive =
                  conversation.id === activeConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      if (!isLoading) {
                        setActiveConversationId(conversation.id);
                      }
                    }}
                    disabled={isLoading}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/60"
                    } disabled:cursor-not-allowed`}
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

                    <span className="min-w-0 truncate">
                      {conversation.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" />
            New Chat
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Sparkles className="size-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">
                AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeConversationId
                  ? conversations.find(
                      (conversation) =>
                        conversation.id === activeConversationId,
                    )?.title ?? "Your personal productivity copilot"
                  : "Your personal productivity copilot"}
              </p>
            </div>

            {/* Mobile New Chat */}
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isLoading}
              className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-lg border md:hidden"
              aria-label="New chat"
              title="New chat"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading conversation...
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
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
              })
            )}

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
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask LifeOS anything..."
                rows={1}
                disabled={isLoading || isLoadingMessages}
                className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={
                !input.trim() ||
                isLoading ||
                isLoadingMessages
              }
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
    </div>
  );
}