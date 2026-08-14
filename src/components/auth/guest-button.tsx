"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserRound } from "lucide-react";

export function GuestButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo continuar como invitado");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Error de red, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      {loading ? "Entrando..." : "Continuar como invitado"}
    </button>
  );
}
