import { Suspense } from "react";
import Link from "next/link";
import { BookImage } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { googleOAuthEnabled } from "@/lib/google-oauth";

export const metadata = {
  title: "Iniciar sesión — Picbook",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-semibold">
            <BookImage className="h-7 w-7 text-accent" aria-hidden="true" />
            Picbook
          </Link>
          <h1 className="mt-6 font-serif text-2xl font-semibold tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para ver tus fotolibros.
          </p>
        </div>

        <Suspense>
          <LoginForm googleEnabled={googleOAuthEnabled()} />
        </Suspense>
      </div>
    </div>
  );
}
