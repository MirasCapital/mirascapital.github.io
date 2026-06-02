"use client"

import { useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

/**
 * Sticky, scroll-aware top nav.
 *
 * Over the hero it's transparent and the wordmark is hidden (the giant hero
 * wordmark is right there, so repeating it would be redundant). Once you scroll
 * past the hero, a blurred navy backdrop fades in and the small wordmark
 * appears, keeping the brand + nav available for the rest of the page.
 *
 * Scroll state comes from Motion's `useScroll` (no `window.addEventListener`).
 * Links carry an origin-left underline that grows from the left on hover.
 */
const links = [
  { href: "#about", label: "About", mobile: false },
  { href: "#transactions", label: "Transactions", mobile: false },
  { href: "#contact", label: "Contact", mobile: true },
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
        <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`transition-colors duration-200 hover:text-white ${
                l.mobile ? "" : "hidden sm:inline"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
