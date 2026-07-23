import Link from "next/link";
import { BookImage } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { googleOAuthEnabled } from "@/lib/google-oauth";

export const metadata = {
  title: "Crear cuenta — Memora",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-semibold">
            <BookImage className="h-7 w-7 text-accent" aria-hidden="true" />
            Memora
          </Link>
          <h1 className="mt-6 font-serif text-2xl font-semibold tracking-tight">
            Creá tu cuenta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guardá y organizá tus recuerdos en fotolibros digitales.
          </p>
        </div>

        <RegisterForm googleEnabled={googleOAuthEnabled()} />
      </div>
    </div>
  );
}
