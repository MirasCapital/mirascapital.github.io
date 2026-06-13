"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/**
 * Scroll-reveal wrapper. Fades + lifts its children into place the first time
 * they enter the viewport, then leaves them alone. Under reduced motion the
 * reveal is a zero-duration snap — the initial state must not branch on the
 * preference, because the server can't know it and branching causes a
 * hydration mismatch. Uses the skill's canonical strong ease-out curve so the
 * motion feels intentional, not floaty.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
