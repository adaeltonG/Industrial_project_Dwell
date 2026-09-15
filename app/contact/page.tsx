import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Contact | Dwell",
  description: "Contact the Dwell team."
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="page information-page">
        <header className="information-page__heading">
          <p className="shopping-eyebrow">Contact Dwell</p>
          <h1>How can we help?</h1>
          <p>Send the team a message using the form below.</p>
        </header>
        <ContactForm />
      </main>
    </>
  );
}
