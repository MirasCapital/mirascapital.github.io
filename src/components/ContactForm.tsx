"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react"

const ACCESS_KEY = "087fba1e-6e92-4fc4-9e2d-1d626a0bea5e"

type Status = "idle" | "sending" | "ok" | "error"

const inputClass =
  "peer w-full rounded-2xl border border-cloud/14 bg-cloud/[0.035] px-5 pb-3 pt-7 text-[15px] text-cloud outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-cloud/28 focus:border-accent/70 focus:bg-cloud/[0.055] focus:ring-4 focus:ring-accent/10"
const labelClass =
  "pointer-events-none absolute left-5 top-2.5 origin-left text-[0.67rem] font-medium tracking-[0.02em] text-cloud/45 transition-[color,font-size,transform,top] duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-placeholder-shown:text-cloud/42 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[0.67rem] peer-focus:font-medium peer-focus:text-accent"

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

function MessageField() {
  return (
    <div className="relative">
      <textarea
        id="cf-message"
        name="message"
        required
        rows={5}
        placeholder=" "
        className={`${inputClass} min-h-36 resize-y`}
      />
      <label htmlFor="cf-message" className={`${labelClass} peer-placeholder-shown:top-7 peer-placeholder-shown:translate-y-0`}>
        What are you considering?
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={sending}>
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input type="hidden" name="subject" value="New Contact Form Submission - Miras Capital" />

      <Field id="cf-name" name="name" type="text" label="Full name" autoComplete="name" />
      <Field id="cf-email" name="email" type="email" label="Email" autoComplete="email" />
      <Field id="cf-mobile" name="mobile" type="tel" label="Mobile" autoComplete="tel" />
      <MessageField />

      <button
        type="submit"
        disabled={sending}
        className="group mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-ink transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-accent-bright active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65"
      >
        {sending ? "Sending" : "Start the conversation"}
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
          initial={reduce ? false : { opacity: 0, transform: "translateY(6px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            ok
              ? "border-accent/30 bg-accent/10 text-accent-bright"
              : "border-[#f1957f]/40 bg-[#f1957f]/10 text-[#f4a18d]"
          }`}
        >
          {ok ? (
            <CheckCircle size={18} weight="fill" className="shrink-0" />
          ) : (
            <WarningCircle size={18} weight="fill" className="shrink-0" />
          )}
          <span>
            {ok
              ? "Thanks. We will be in touch shortly."
              : "Something went wrong. Please try again shortly."}
          </span>
        </motion.div>
      )}
    </form>
  )
}
