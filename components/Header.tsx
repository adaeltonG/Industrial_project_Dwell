"use client";

import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { Wordmark } from "@/components/Wordmark";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";

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
  const { user, loading, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function signOut() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  const accountActions = user ? (
    <>
      {user.role === "ADMIN" || user.role === "VENDOR" ? <Link href="/admin" className="btn btn--outline">Manage</Link> : null}
      <button className="btn btn--primary" type="button" onClick={signOut}>Log out</button>
    </>
  ) : loading ? null : <Link href="/login" className="btn btn--primary">Log in</Link>;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Wordmark />
        <SearchBar
          className="site-header__search"
          placeholder={searchPlaceholder}
        />
        <nav className="site-header__actions" aria-label="Primary navigation">
          <Link href="/cart" className="cart-link" aria-label={`Cart, ${count} items`}><ShoppingBag size={22} aria-hidden="true" />Cart <span>{count}</span></Link>
          {showVendors ? (
            <Link href="/vendors" className="btn btn--outline">
              Vendors
            </Link>
          ) : null}
          {accountActions}
        </nav>
        <Link href="/cart" className="cart-link cart-link--mobile" aria-label={`Cart, ${count} items`}><ShoppingBag size={22} aria-hidden="true" /><span>{count}</span></Link>
        {mobileAction === "menu" ? (
          <button
            className="icon-button site-header__mobile"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu aria-hidden="true" size={38} strokeWidth={2.4} />
          </button>
        ) : (
          user ? <button className="btn btn--primary site-header__mobile-login" onClick={signOut}>Log out</button> :
            <Link href="/login" className="btn btn--primary site-header__mobile-login">Log in</Link>
        )}
      </div>
      {menuOpen ? (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <Link href="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link href="/vendors" onClick={() => setMenuOpen(false)}>Vendors</Link>
          {user?.role === "ADMIN" || user?.role === "VENDOR" ? <Link href="/admin">Manage products</Link> : null}
          {user ? <button type="button" onClick={signOut}>Log out</button> : <Link href="/login">Log in</Link>}
        </nav>
      ) : null}
    </header>
  );
}
