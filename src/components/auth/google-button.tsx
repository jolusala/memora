export function GoogleButton() {
  return (
    <a
      href="/api/auth/google"
      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.42 3.58v3h3.91c2.29-2.11 3.53-5.21 3.53-8.82z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.91-3c-1.08.72-2.47 1.16-4.02 1.16-3.1 0-5.72-2.09-6.66-4.9H1.3v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.34 14.35c-.24-.72-.38-1.49-.38-2.35s.14-1.63.38-2.35V6.56H1.3A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.3 5.44l4.04-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.56l4.04 3.09c.94-2.81 3.56-4.9 6.66-4.9z"
        />
      </svg>
      Continuar con Google
    </a>
  );
}
