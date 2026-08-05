import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Wordmark light />
        <nav className="footer__links" aria-label="Footer navigation">
          <Link href="#">About</Link>
          <Link href="#">Privacy</Link>
          <Link href="/vendors/north-co">Vendors</Link>
          <Link href="#">Contact</Link>
        </nav>
        <p className="footer__copyright">© 2026 Dwell</p>
      </div>
    </footer>
  );
}
