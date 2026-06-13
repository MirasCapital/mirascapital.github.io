"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Site-wide inertia scrolling via Lenis. Renders nothing; mounts once in the
 * root layout. Skipped entirely under prefers-reduced-motion (native scroll
 * remains, and globals.css keeps CSS smooth-scroll for anchors in that case).
 *
 * Anchor clicks are intercepted so in-page navigation animates through Lenis
 * instead of jumping natively. Lenis's scrollTo already subtracts the
 * target's scroll-margin-top, so no manual offset is passed.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis()

    let raf = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as HTMLElement).closest?.(
        "a[href^='#']",
      ) as HTMLAnchorElement | null
      if (!link) return
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1))
      const el = id ? document.getElementById(id) : null
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el)
      history.pushState(null, "", `#${id}`)
    }
    document.addEventListener("click", onClick)

    return () => {
      document.removeEventListener("click", onClick)
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
