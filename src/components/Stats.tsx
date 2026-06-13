"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { Reveal } from "./Reveal"

export type Stat = {
  value: number
  prefix?: string
  suffix?: string
  label: string
}

/**
 * Counts from 0 to `value` the first time it scrolls into view. Until then
 * (and under reduced motion, or pre-hydration) it shows the final value, so
 * the number is never wrong — it only ever animates while being watched.
 */
function CountUp({ value, prefix = "", suffix = "" }: Omit<Stat, "label">) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(value)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-AU")}
      {suffix}
    </span>
  )
}

/** Stat row for the About section: big display numbers over quiet labels. */
export function Stats({ stats, once = true }: { stats: Stat[]; once?: boolean }) {
  return (
    <div className="mt-16 grid grid-cols-1 gap-10 border-t border-white/10 pt-12 sm:grid-cols-3">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} once={once}>
          <div className="font-display text-5xl font-semibold leading-none text-white sm:text-6xl">
            <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </div>
          <div className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            {s.label}
          </div>
        </Reveal>
      ))}
    </div>
  )
}
