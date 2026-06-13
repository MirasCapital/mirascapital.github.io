"use client"

import { useRef } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"
import type { ReactNode } from "react"

/**
 * Magnetic wrapper: its child drifts toward the pointer while the cursor is
 * near, then springs back to rest on leave. The listening area is padded
 * slightly beyond the visible child (`p-3 -m-3`) so the pull begins just
 * before you reach it — the "attraction" that reads as magnetic rather than
 * as a plain hover.
 *
 * `strength` is the fraction of the cursor's offset-from-centre the child
 * follows (0.4 ≈ subtle, premium).
 *
 * Reduced motion only gates the *behaviour* (the move handler returns early,
 * so the springs stay at rest) — it must NOT change what's rendered, or the
 * server (which can't know the preference) and the client would disagree and
 * React would report a hydration mismatch. The markup is identical either way.
 */
const SPRING = { stiffness: 260, damping: 20, mass: 0.4 }

export function Magnetic({
  children,
  strength = 0.4,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (reduce || !el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block p-3 -m-3 ${className ?? ""}`}
    >
      {children}
    </motion.span>
  )
}
