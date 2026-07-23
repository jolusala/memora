import Link from "next/link";
import { BookImage } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { OccasionShowcase } from "@/components/landing/occasion-showcase";
import { Features } from "@/components/landing/features";

export default async function LandingPage() {
  const session = await getSessionUser();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <BookImage className="h-6 w-6 text-accent" aria-hidden="true" />
            Memora
          </Link>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {session ? "Mi panel" : "Iniciar sesión"}
          </Link>
        </div>
      </header>

      <Hero isAuthenticated={Boolean(session)} />
      <HowItWorks />
      <OccasionShowcase isAuthenticated={Boolean(session)} />
      <Features />

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          Memora — un lugar para guardar tus recuerdos.
        </div>
      </footer>
    </div>
  );
}
