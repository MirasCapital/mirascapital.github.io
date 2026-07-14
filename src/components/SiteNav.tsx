"use client"

import { useCallback, useEffect, useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

function NavLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <a
      href={href}
      className={`group relative py-2 text-[0.67rem] font-medium uppercase tracking-[0.13em] text-cloud/62 transition-colors duration-200 hover:text-cloud ${className}`}
    >
      {label}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-200 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
      />
    </a>
  )
}

export function SiteNav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [showWordmark, setShowWordmark] = useState(false)

  const syncHeader = useCallback((y: number) => {
    setScrolled(y > 32)
    setShowWordmark(y >= window.innerHeight * 0.78)
  }, [])

  useMotionValueEvent(scrollY, "change", (y) => {
    syncHeader(y)
  })

  useEffect(() => {
    syncHeader(window.scrollY)
    const onResize = () => syncHeader(window.scrollY)
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [syncHeader])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-200 ${
        scrolled
          ? "border-cloud/10 bg-ink/82 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a
          href="#top"
          translate="no"
          aria-hidden={!showWordmark}
          tabIndex={showWordmark ? 0 : -1}
          className={`font-display text-base font-bold uppercase leading-none tracking-[0.045em] text-cloud transition-[opacity,transform] duration-200 ease-out sm:text-lg ${
            showWordmark
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1.5 opacity-0"
          }`}
        >
          Miras Capital
        </a>
        <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-7">
          <NavLink href="#about" label="About" />
          <NavLink href="#transactions" label="Transactions" className="max-[479px]:hidden" />
          <NavLink href="#contact" label="Contact" />
        </nav>
      </div>
    </header>
  )
}
