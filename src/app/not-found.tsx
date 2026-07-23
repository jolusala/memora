import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-serif text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">No encontramos lo que buscabas.</p>
      <Button asChild variant="accent">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
