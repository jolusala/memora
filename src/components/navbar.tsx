"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookImage, LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PublicUser } from "@/types";

export function Navbar({ user }: { user: PublicUser }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight"
        >
          <BookImage className="h-6 w-6 text-accent" aria-hidden="true" />
          Memora
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
              <AvatarFallback>{initials || <UserIcon className="h-4 w-4" />}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">{user.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {user.isGuest ? "Cuenta de invitado" : user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.isGuest ? (
              <DropdownMenuItem asChild>
                <Link href="/register">
                  <UserIcon className="h-4 w-4" />
                  Crear cuenta para guardar tus datos
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
