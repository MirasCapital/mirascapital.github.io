"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { FlowField } from "./FlowField"

/**
 * The persistent scene behind the whole page.
 *
 * The flow-field shader is a single `fixed` layer that never unmounts, so as
 * the snap-paged sections scroll over it the site reads as one continuous
 * scene rather than separate pages. Two fixed scrims sit above it:
 *
 *  1. a constant left→right gradient that keeps left-aligned text legible
 *     over the vivid right side of the flow, and
 *  2. a dark veil whose opacity ramps from near-zero on the hero to ~0.6 once
 *     you've scrolled a viewport in, so content stages stay readable.
 *
 * The same scroll position feeds an `intensity` ref the shader reads each
 * frame, slowing the flow as you move into content — the "calm" half of
 * calm-and-dim. All of it freezes sensibly under reduced motion (the veil
 * still applies; the shader renders a single static frame on its own).
 */
export function ImmersiveBackground() {
  const intensity = useRef(1)
  const { scrollY } = useScroll()
  const [vh, setVh] = useState(900)

  useEffect(() => {
    const set = () => setVh(window.innerHeight)
    set()
    window.addEventListener("resize", set)
    return () => window.removeEventListener("resize", set)
  }, [])

  // Dark veil: 0.06 on the hero → 0.6 by the time the first content stage fills
  // the viewport, then held.
  const veil = useTransform(scrollY, [0, vh * 0.85], [0.06, 0.6])

  // Feed shader speed from the same range: full (1) on the hero → calm (0.45).
  useEffect(() => {
    const unsub = scrollY.on("change", (y) => {
      const t = Math.min(y / (vh * 0.85), 1)
      intensity.current = 1 - t * 0.55
    })
    return unsub
  }, [scrollY, vh])

  return (
    <>
      <FlowField intensityRef={intensity} className="fixed inset-0 z-0 h-full w-full" />
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
