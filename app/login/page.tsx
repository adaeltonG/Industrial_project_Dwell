import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Wordmark />
        <section className="auth-card" aria-labelledby="login-heading">
          <h1 id="login-heading">Log in</h1>
          <form>
            <label>
              Email
              <input type="email" placeholder="name@example.com" />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" />
            </label>
            <p className="auth-prompt">
              No account? <Link href="/register">Register</Link>
            </p>
            <button className="btn btn--primary" type="button">
              Log in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
