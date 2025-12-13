"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{ type: "text"; text: string }>;
};

function ChatInner({ initialMessages }: { initialMessages: UiMessage[] }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  const { messages, sendMessage, status, error, stop, clearError } = useChat({
    transport,
    messages: initialMessages,
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const renderedMessages = useMemo(() => {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => {
        const text = m.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("");

        return { id: m.id, role: m.role, text };
      });
  }, [messages]);

  useEffect(() => {
    // Keep latest message visible.
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [renderedMessages.length, isLoading]);

  return (
    <section
      aria-label="Chat con tu asistente"
      className="mx-auto flex w-full max-w-3xl flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
            Asistente
          </h1>
          <p className="text-sm text-muted-foreground">
            Conversación personalizada usando tu historial.
          </p>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            isLoading
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
          aria-live="polite"
        >
          {isLoading ? "Escribiendo…" : "Listo"}
        </div>
      </div>

      {/* ChatGPT-like panel: continuous surface, no white border */}
      <div className="flex h-[70vh] flex-col overflow-hidden rounded-lg bg-muted/30">
        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-5">
          {renderedMessages.length === 0 ? (
            <div className="rounded-lg bg-background/60 p-6 text-sm text-muted-foreground">
              Escribe un mensaje para empezar.
            </div>
          ) : (
            <ul className="space-y-4" aria-live="polite">
              {renderedMessages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <li
                    key={m.id}
                    className={cn(
                      "flex",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex max-w-[85%] flex-col gap-1">
                      <span className="sr-only">
                        {isUser
                          ? "Mensaje del usuario"
                          : "Mensaje del asistente"}
                      </span>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/70 text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {m.text}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}

              {isLoading ? (
                <li className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl bg-background/70 px-4 py-2.5 text-sm text-muted-foreground">
                    Generando respuesta…
                  </div>
                </li>
              ) : null}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border/60 bg-background/70 px-4 py-3 backdrop-blur">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (input.trim().length === 0 || isLoading) return;
              clearError();
              const text = input;
              setInput("");
              await sendMessage({ text });
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              disabled={isLoading || input.trim().length === 0}
              className="shrink-0"
            >
              {isLoading ? "Enviando…" : "Enviar"}
            </Button>

            {isLoading ? (
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => stop()}
              >
                Detener
              </Button>
            ) : null}
          </form>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}
    </section>
  );
}

export function Chat() {
  const [initialMessages, setInitialMessages] = useState<UiMessage[] | null>(
    null
  );
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/chat/history");
        if (!res.ok) {
          if (res.status === 401) {
            setLoadError("Inicia sesión para ver tu historial.");
            setInitialMessages([]);
            return;
          }
          throw new Error("No se pudo cargar el historial");
        }

        const data = (await res.json()) as { messages?: UiMessage[] };
        if (!mounted) return;
        setInitialMessages(data.messages ?? []);
      } catch {
        if (!mounted) return;
        setLoadError("No se pudo cargar el historial.");
        setInitialMessages([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (initialMessages === null) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Cargando historial…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {loadError ? (
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {loadError}
          </div>
        </div>
      ) : null}
      <ChatInner initialMessages={initialMessages} />
    </>
  );
}
