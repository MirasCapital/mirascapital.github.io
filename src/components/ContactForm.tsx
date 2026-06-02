"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react"

// Posts to Web3Forms (no backend needed, works on a static GitHub Pages site).
// Same access key as the original site.
const ACCESS_KEY = "087fba1e-6e92-4fc4-9e2d-1d626a0bea5e"

type Status = "idle" | "sending" | "ok" | "error"

// Floating-label field: the title sits centered inside the box like a
// placeholder, then shrinks and rises to the top edge on focus or once the
// field has a value. The real <label> stays in the DOM and stays associated
// (htmlFor/id), so this is a true floating label, not placeholder-as-label.
const inputClass =
  "peer w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 pt-6 pb-2 text-[15px] text-white outline-none transition duration-200 hover:border-white/25 focus:border-orange/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-orange/15"
const labelClass =
  "pointer-events-none absolute left-4 top-2 origin-left text-[0.7rem] font-medium tracking-[0.02em] text-white/45 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[0.7rem] peer-focus:font-medium peer-focus:text-orange/80"

function Field({
  id,
  name,
  type,
  label,
  autoComplete,
}: {
  id: string
  name: string
  type: string
  label: string
  autoComplete: string
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        required
        autoComplete={autoComplete}
        placeholder=" "
        className={inputClass}
      />
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const reduce = useReducedMotion()
  const sending = status === "sending"
  const ok = status === "ok"
  const error = status === "error"

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input
        type="hidden"
        name="subject"
        value="New Contact Form Submission - Miras Capital"
      />

      <Field id="cf-name" name="name" type="text" label="Full name" autoComplete="name" />
      <Field id="cf-email" name="email" type="email" label="Email" autoComplete="email" />
      <Field id="cf-mobile" name="mobile" type="tel" label="Mobile" autoComplete="tel" />

      <button
        type="submit"
        disabled={sending}
        className="group mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-orange px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-navy transition duration-200 ease-out hover:bg-gold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {sending ? "Sending" : "Let's talk"}
        {sending ? (
          <CircleNotch size={18} weight="bold" className="animate-spin" />
        ) : (
          <ArrowRight
            size={18}
            weight="bold"
            className="transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        )}
      </button>

      {(ok || error) && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            ok
              ? "border-gold/30 bg-gold/10 text-gold-light"
              : "border-[#f1957f]/40 bg-[#f1957f]/10 text-[#f1957f]"
          }`}
        >
          {ok ? (
            <CheckCircle size={18} weight="fill" className="shrink-0" />
          ) : (
            <WarningCircle size={18} weight="fill" className="shrink-0" />
          )}
          <span>
            {ok
              ? "Thanks, we'll be in touch shortly."
              : "Something went wrong. Please email us directly."}
          </span>
        </motion.div>
      )}
    </form>
  )
}
