"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await register(String(form.get("name")), String(form.get("email")), String(form.get("password")));
      router.push("/products");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Wordmark />
        <section className="auth-card" aria-labelledby="register-heading">
          <h1 id="register-heading">Register</h1>
          <form onSubmit={submit}>
            <label>Name<input name="name" type="text" placeholder="Your name" minLength={2} maxLength={100} required autoComplete="name" /></label>
            <label>Email<input name="email" type="email" placeholder="name@example.com" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" placeholder="••••••••" minLength={8} maxLength={72} required autoComplete="new-password" /></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="btn btn--secondary" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
            <p className="auth-prompt">Already have an account? <Link href="/login">Log in</Link></p>
          </form>
        </section>
      </div>
    </main>
  );
}
