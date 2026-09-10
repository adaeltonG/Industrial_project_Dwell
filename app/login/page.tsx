"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(user.role === "ADMIN" ? "/admin" : "/products");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Wordmark />
        <section className="auth-card" aria-labelledby="login-heading">
          <h1 id="login-heading">Log in</h1>
          <form onSubmit={submit}>
            <label>Email<input name="email" type="email" placeholder="name@example.com" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" /></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <p className="auth-prompt">No account? <Link href="/register">Register</Link></p>
            <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
