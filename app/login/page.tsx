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
            <button className="btn btn--primary" type="button">
              Log in
            </button>
            <p>
              No account? <Link href="#register">Register</Link>
            </p>
          </form>
        </section>

        <section className="auth-card" id="register" aria-labelledby="register-heading">
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
          </form>
        </section>
      </div>
    </main>
  );
}
