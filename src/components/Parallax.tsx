"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import type { ReactNode } from "react"

/**
 * Subtle scroll-linked drift: translates its children from `from`px to `to`px
 * across the element's journey through the viewport. Keep the travel small
 * (±20–40px) — restrained parallax reads premium, big parallax reads gimmicky.
 *
 * Reduced motion freezes the drift, but only after mount: the server can't
 * know the preference, so the first client render must match the SSR output
 * (the moving style) or React reports a hydration mismatch.
 */
export function Parallax({
  children,
  from = 24,
  to = -24,
  className,
}: {
  children: ReactNode
  from?: number
  to?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const drift = useTransform(scrollYProgress, [0, 1], [from, to])
  const still = useMotionValue(0)
  const y = mounted && reduce ? still : drift

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
