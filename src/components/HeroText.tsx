"use client"

import { motion, useReducedMotion } from "motion/react"

/**
 * Hero wordmark + tagline with a one-time entrance. This is the first
 * impression (seen once per visit), so a deliberate stagger earns its keep:
 * the wordmark lifts in, the tagline follows a beat later. Reduced-motion
 * collapses both to a static final state.
 */
export function HeroText() {
  const reduce = useReducedMotion()
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <div className="flex flex-1 flex-col justify-center pb-28">
      <motion.h1
        translate="no"
        {...enter(0.05)}
        className="font-display font-bold uppercase leading-[0.95] tracking-[0.02em] text-white"
        style={{
          fontSize: "clamp(2.75rem, 9vw, 6rem)",
          textWrap: "balance",
          textShadow: "0 2px 48px rgba(0,0,20,0.7)",
        }}
      >
        Miras Capital
      </motion.h1>
      <motion.p
        {...enter(0.18)}
        className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/80 sm:text-xl"
        style={{ textShadow: "0 1px 24px rgba(0,0,20,0.85)" }}
      >
        Providing Independent Advice.
        <br />
        Investing in Shared Ambitions.
      </motion.p>
    </div>
  )
}
