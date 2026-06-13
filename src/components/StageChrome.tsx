"use client"

import { useEffect, useState } from "react"

/**
 * Persistent cinematic framing for the paged layout:
 *
 *  • right-edge progress dots — which stage you're on, clickable to jump
 *  • a bottom-left frame counter ("02 / 04") — quiet film-style chrome
 *
 * Both track the active stage via one IntersectionObserver. The counter hides
 * on the closing (contact) stage so the real footer reads as the final frame.
 * Desktop only — the paged experience (and this chrome) is a large-screen
 * thing; small screens scroll normally without it.
 */
const STAGES = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "transactions", label: "Transactions" },
  { id: "contact", label: "Contact" },
]

export function StageChrome() {
  const [active, setActive] = useState("top")

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { threshold: 0.5 },
    )
    for (const s of STAGES) {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [])

  const activeIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.id === active),
  )

  return (
    <>
      {/* Right-edge progress dots */}
      <nav
        aria-label="Page sections"
        className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
      >
        {STAGES.map((s) => {
          const on = s.id === active
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-label={s.label}
              aria-current={on}
              className="group relative flex items-center justify-center p-1.5"
            >
              <span
                className={`block rounded-full transition-all duration-300 ease-out ${
                  on
                    ? "h-2.5 w-2.5 bg-white"
                    : "h-1.5 w-1.5 bg-white/35 group-hover:bg-white/70"
                }`}
              />
              <span className="pointer-events-none absolute right-6 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-70">
                {s.label}
              </span>
            </a>
          )
        })}
      </nav>

      {/* Bottom-left frame counter — hidden on the closing stage */}
      <div
        aria-hidden
        className={`fixed bottom-6 left-6 z-30 hidden font-display text-xs tracking-[0.25em] text-white/45 transition-opacity duration-500 md:block ${
          active === "contact" ? "opacity-0" : "opacity-100"
        }`}
      >
        {String(activeIndex + 1).padStart(2, "0")}
        <span className="mx-1 text-white/25">/</span>
        {String(STAGES.length).padStart(2, "0")}
      </div>
    </>
  )
}
