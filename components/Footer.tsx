import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Wordmark light />
        <nav className="footer__links" aria-label="Footer navigation">
          <Link href="/#about">About</Link>
          <a href="mailto:privacy@dwell.com">Privacy</a>
          <Link href="/vendors">Vendors</Link>
          <a href="mailto:hello@dwell.com">Contact</a>
        </nav>
        <p className="footer__copyright">© 2026 Dwell</p>
      </div>
    </footer>
  );
}
