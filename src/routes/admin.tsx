import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY, ADMIN_USER, writeStored } from "@/lib/kryso-storage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Login | Kryso Music Academy" },
      { name: "description", content: "Demo admin login for the Kryso Music Academy website." },
      { property: "og:title", content: "Admin Login | Kryso Music Academy" },
      { property: "og:description", content: "Demo admin login for the Kryso Music Academy website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center bg-secondary px-4 text-secondary-foreground">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-secondary-foreground/70 hover:text-primary">
          <ArrowLeft size={15} /> Back to the website
        </Link>
        <div className="mt-5 rounded-2xl bg-card p-8 text-card-foreground shadow-lg">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <Music2 size={20} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the demo content of Kryso Music Academy.</p>
          <form
            className="mt-7 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (username.trim() === ADMIN_USER && password === ADMIN_PASSWORD) {
                writeStored(ADMIN_SESSION_KEY, { user: ADMIN_USER, at: Date.now() });
                navigate({ to: "/admin/dashboard" });
              } else {
                setError("Those details don't match. Try admin / admin123.");
              }
            }}
          >
            <label className="grid gap-1.5 text-sm font-semibold">
              Username
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" autoComplete="username" required />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Password
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                autoComplete="current-password"
                required
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 rounded-full font-bold">
              <Lock size={16} /> Sign in
            </Button>
          </form>
          <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            Demo credentials · username <strong>admin</strong> · password <strong>admin123</strong>. Everything is stored in your browser only.
          </p>
        </div>
      </div>
    </div>
  );
}
