import Link from "next/link";
import { Menu } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Wordmark } from "@/components/Wordmark";

type HeaderProps = {
  searchPlaceholder?: string;
  mobileAction?: "menu" | "login";
  showVendors?: boolean;
};

export function Header({
  searchPlaceholder,
  mobileAction = "menu",
  showVendors = true
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Wordmark />
        <SearchBar
          className="site-header__search"
          placeholder={searchPlaceholder}
        />
        <nav className="site-header__actions" aria-label="Primary navigation">
          {showVendors ? (
            <Link href="/vendors/north-co" className="btn btn--outline">
              Vendors
            </Link>
          ) : null}
          <Link href="/login" className="btn btn--primary">
            Log in
          </Link>
        </nav>
        {mobileAction === "menu" ? (
          <button className="icon-button site-header__mobile" aria-label="Open menu">
            <Menu aria-hidden="true" size={38} strokeWidth={2.4} />
          </button>
        ) : (
          <Link href="/login" className="btn btn--primary site-header__mobile-login">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
