import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Wordmark />
        <section className="auth-card" aria-labelledby="register-heading">
          <h1 id="register-heading">Register</h1>
          <form>
            <label>
              Name
              <input type="text" placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" placeholder="name@example.com" />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" />
            </label>
            <button className="btn btn--secondary" type="button">
              Create account
            </button>
            <p className="auth-prompt">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
