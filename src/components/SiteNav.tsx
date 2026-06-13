"use client"

import { useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

/**
 * Sticky, scroll-aware top nav.
 *
 * Over the hero it's transparent and the wordmark is hidden (the giant hero
 * wordmark is right there, so repeating it would be redundant). Once you scroll
 * past the hero, a blurred black backdrop fades in and the small wordmark
 * appears, keeping the brand + nav available for the rest of the page.
 *
 * Scroll state comes from Motion's `useScroll` (no `window.addEventListener`).
 * Every link carries an underline that grows from the centre on hover.
 */

// A nav link with a centre-grow underline on hover (snaps under reduced
// motion). Shared by all three items so they read identically.
function NavLink({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <a
      href={href}
      className={`group relative text-white/60 transition-colors duration-200 hover:text-white ${
        className ?? ""
      }`}
    >
      {label}
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-0 h-px w-full origin-center scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
      />
    </a>
  )
}

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
          ? "border-white/10 bg-black/65 backdrop-blur-md"
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
          <NavLink href="#about" label="About" className="hidden sm:inline" />
          <NavLink
            href="#transactions"
            label="Transactions"
            className="hidden sm:inline"
          />
          <NavLink href="#contact" label="Contact" />
        </nav>
      </div>
    </header>
  )
}
