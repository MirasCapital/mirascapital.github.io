"use client"

import { useState } from "react"

// Posts to Web3Forms (no backend needed — works on a static GitHub Pages site).
// Same access key as the original site.
const ACCESS_KEY = "087fba1e-6e92-4fc4-9e2d-1d626a0bea5e"

type Status = "idle" | "sending" | "ok" | "error"

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus("sending")
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
      })
      const json = await res.json()
      if (json.success) {
        setStatus("ok")
        form.reset()
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-teal/70 focus:bg-white/[0.06]"

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input
        type="hidden"
        name="subject"
        value="New Contact Form Submission - Miras Capital"
      />

      <input
        type="text"
        name="name"
        required
        aria-label="Full name"
        placeholder="Full name"
        className={inputClass}
      />
      <input
        type="email"
        name="email"
        required
        aria-label="Email"
        placeholder="Email"
        className={inputClass}
      />
      <input
        type="tel"
        name="mobile"
        required
        aria-label="Mobile"
        placeholder="Mobile"
        className={inputClass}
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-navy transition-[background-color,opacity] hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Let's talk"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className="min-h-[1.25rem] text-sm"
        style={{
          color:
            status === "ok"
              ? "var(--color-gold-light)"
              : status === "error"
                ? "#f1957f"
                : "transparent",
        }}
      >
        {status === "ok"
          ? "Thanks — we'll be in touch shortly."
          : status === "error"
            ? "Something went wrong. Please email us directly."
            : " "}
      </p>
    </form>
  )
}
