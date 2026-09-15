import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy | Dwell",
  description: "How Dwell handles information when you use the platform."
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="page information-page information-page--privacy">
        <header className="information-page__heading">
          <p className="shopping-eyebrow">Privacy</p>
          <h1>Your privacy at Dwell</h1>
          <p>Last updated: 15 September 2026</p>
        </header>
        <div className="privacy-content">
          <section><h2>Information we use</h2><p>Dwell uses account details you provide when registering or signing in, including your name and email address. Passwords are stored as protected hashes. Saved products are associated with your account so they remain available when you return.</p></section>
          <section><h2>Cart and checkout</h2><p>Your cart is stored in your browser. The checkout is a demonstration and checks current product information, but it does not process a payment or create an order.</p></section>
          <section><h2>How information is used</h2><p>Account information is used to authenticate you and provide platform features. Dwell does not sell personal information. Product links may take you to an independent vendor whose own privacy policy then applies.</p></section>
          <section><h2>Your choices</h2><p>You can use the public catalogue without an account. You can remove products from your cart or saved list, log out at any time, and contact the team with a privacy question through the contact form.</p></section>
        </div>
      </main>
    </>
  );
}
