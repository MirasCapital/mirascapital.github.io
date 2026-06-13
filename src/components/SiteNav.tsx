"use client"

import { useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"
import { Magnetic } from "./Magnetic"

/**
 * Sticky, scroll-aware top nav.
 *
 * Over the hero it's transparent and the wordmark is hidden (the giant hero
 * wordmark is right there, so repeating it would be redundant). Once you scroll
 * past the hero, a blurred navy backdrop fades in and the small wordmark
 * appears, keeping the brand + nav available for the rest of the page.
 *
 * Scroll state comes from Motion's `useScroll` (no `window.addEventListener`).
 * The text links carry an underline that grows from the centre on hover; the
 * Contact CTA is a magnetic pill that drifts toward the cursor.
 */
const links = [
  { href: "#about", label: "About" },
  { href: "#transactions", label: "Transactions" },
]

export function SiteNav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 40
    if (next !== scrolled) setScrolled(next)
  })

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-navy-deep/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#top"
          className={`font-display text-lg font-bold uppercase leading-none tracking-[0.04em] text-white transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Miras Capital
        </a>
        <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.18em]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative hidden text-white/60 transition-colors duration-200 hover:text-white sm:inline"
            >
              {l.label}
              {/* Underline grows from the centre out on hover. Snaps (no
                  transition) under reduced motion. */}
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-px w-full origin-center scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </a>
          ))}
          <Magnetic>
            <a
              href="#contact"
              className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-white/80 transition-colors duration-200 hover:border-white/60 hover:bg-white/[0.06] hover:text-white"
            >
              Contact
            </a>
          </Magnetic>
        </nav>
      </div>
    </header>
  )
}
