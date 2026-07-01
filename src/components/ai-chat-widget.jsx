import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildApiUrl } from "@/lib/api-client";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageText = input.trim();
    const newUserMsg = {
      id: Date.now(),
      sender: "user",
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    const history = messages.map(msg => ({
      role: msg.sender === "bot" ? "model" : "user",
      text: msg.text
    }));

    try {
      const response = await fetch(buildApiUrl("/api/ai/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessageText, history }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to backend");
      }

      const data = await response.json();
      
      const botResponse = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.reply || "Something went wrong.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorResponse = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Sorry, I am having trouble connecting to the server.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={cn(
          "pointer-events-auto mb-4 flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-950/70 sm:w-[380px] w-[calc(100vw-3rem)] h-[500px] max-h-[80vh]",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "!pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 bg-primary/10 p-4 dark:border-white/10 dark:bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Karta AI</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 shadow-sm",
                    msg.sender === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm border border-white/20 bg-white/50 text-foreground dark:border-white/10 dark:bg-white/5"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                  <span
                    className={cn(
                      "text-[10px]",
                      msg.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="flex max-w-[80%] items-center gap-1 rounded-2xl rounded-tl-sm border border-white/20 bg-white/50 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-end gap-2 rounded-xl border border-white/20 bg-white/50 p-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/50 dark:border-white/10 dark:bg-black/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
          {/* <div className="mt-2 text-center text-[10px] text-muted-foreground">
            Press <kbd className="rounded border border-border bg-muted px-1 font-sans">Enter</kbd> to send, <kbd className="rounded border border-border bg-muted px-1 font-sans">Shift + Enter</kbd> for new line
          </div> */}
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 hover:scale-110 active:scale-95",
          isOpen && "rotate-90 bg-muted text-muted-foreground shadow-none"
        )}
      >
        <div
          className={cn(
            "absolute transition-all duration-300",
            isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <MessageSquare size={24} />
        </div>
        <div
          className={cn(
            "absolute transition-all duration-300",
            isOpen ? "scale-100 opacity-100 -rotate-90" : "scale-0 opacity-0 -rotate-90"
          )}
        >
          <X size={24} />
        </div>
      </button>
    </div>
  );
}
