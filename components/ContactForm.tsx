"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  }

  return (
    <form className="contact-form" onSubmit={submit} onChange={() => setSubmitted(false)}>
      <div className="contact-form__row">
        <label>Full name<input name="name" autoComplete="name" maxLength={120} required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      </div>
      <label>Subject<input name="subject" maxLength={160} required /></label>
      <label>Message<textarea name="message" rows={7} maxLength={2000} required /></label>
      {submitted ? <p className="form-status" role="status">Thank you. Your message has been submitted.</p> : null}
      <button className="btn btn--primary" type="submit">Submit message</button>
    </form>
  );
}
