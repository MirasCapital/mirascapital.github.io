"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"

/**
 * The persistent scene behind the whole page: a single high-quality B&W harbour
 * photograph (the glass tower reflecting the Harbour Bridge, the real bridge and
 * the working harbour), shown as a static, full-bleed background. No video and
 * no animation — just the still image.
 *
 * A constant left gradient keeps left-aligned text legible; a scroll-driven dark
 * veil deepens as you leave the hero so content stages stay readable.
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

  const veil = useTransform(scrollY, [0, vh * 0.85], [0.12, 0.62])

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/harbour.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
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
