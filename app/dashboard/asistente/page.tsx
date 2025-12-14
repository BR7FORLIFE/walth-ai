"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chat } from "@app-components/Chat";
import { Button } from "@components/ui/button";

export default function AsistentePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth");
            return;
          }
          if (mounted) setAllowed(false);
          return;
        }
        const data = (await res.json()) as { isPremium?: boolean };
        if (mounted) setAllowed(Boolean(data.isPremium));
      } catch {
        if (mounted) setAllowed(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (allowed === null) {
    return (
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-lg bg-muted/30 p-6">
        <h1 className="text-xl font-semibold text-foreground">Asistente</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Premium requerido para usar el chat personalizado.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => router.push("/dashboard/tracking")}>
            Ir a seguimiento
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/evaluation")}
          >
            Nueva evaluación
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Chat />
    </div>
  );
}
