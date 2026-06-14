"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"

/**
 * The persistent scene behind the whole page: the B&W Sydney harbour reflection
 * with a slow "helicopter cam" move — a push/pull zoom combined with an organic
 * left/right/up/down sway, so it feels like hovering in an aircraft rather than
 * a flat photo. Two un-synced CSS loops (zoom vs pan) keep the drift from
 * feeling mechanical.
 *
 * A constant left gradient keeps left-aligned text legible; a scroll-driven
 * dark veil deepens as you leave the hero so content stages stay readable.
 * Everything stills under prefers-reduced-motion (see globals.css).
 */
export function ImmersiveBackground() {
  const { scrollY } = useScroll()
  const [vh, setVh] = useState(900)

  useEffect(() => {
    const set = () => setVh(window.innerHeight)
    set()
    window.addEventListener("resize", set)
    return () => window.removeEventListener("resize", set)
  }, [])

  // Dark veil: light over the hero → deep behind content stages.
  const veil = useTransform(scrollY, [0, vh * 0.85], [0.12, 0.62])

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* pan = sway; zoom = push/pull. Nested so each transform animates
            independently on its own clock. */}
        <div className="hero-pan absolute inset-0">
          <div
            className="hero-zoom absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/harbour.png)" }}
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-r from-black via-black/55 to-transparent"
      />
      <motion.div
        aria-hidden
        style={{ opacity: veil }}
        className="pointer-events-none fixed inset-0 z-0 bg-black"
      />
    </>
  )
}
