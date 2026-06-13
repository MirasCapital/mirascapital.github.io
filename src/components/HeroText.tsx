"use client"

import { motion, useReducedMotion } from "motion/react"

/**
 * Hero wordmark + tagline. Each line rises into place from behind an
 * overflow mask — the cinematic masked reveal — instead of a plain fade.
 * This is the first impression (seen once per visit), so a deliberate
 * stagger earns its keep: wordmark first, then each tagline line a beat
 * apart. Reduced-motion collapses everything to the static final state.
 */
const EASE = [0.16, 1, 0.3, 1] as const

function MaskedLine({
  children,
  delay,
  reduce,
}: {
  children: React.ReactNode
  delay: number
  reduce: boolean
}) {
  return (
    // The clip mask needs vertical breathing room or the tight hero
    // leading-[0.95] lets `overflow-hidden` shave the tops of the capitals.
    // Em-based padding (compensated by a negative margin so layout doesn't
    // shift) scales with each line's own font size.
    <span className="block overflow-hidden py-[0.12em] -my-[0.12em]">
      <motion.span
        className="block"
        // The initial state must not branch on `reduce`: the server can't
        // know the visitor's motion preference, so branching produces a
        // hydration mismatch. Both environments render the masked state and
        // reduced-motion visitors get a zero-duration snap to rest instead.
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={reduce ? { duration: 0 } : { duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function HeroText() {
  const reduce = useReducedMotion() ?? false

  return (
    <div className="flex flex-1 flex-col justify-center pb-28">
      <h1
        translate="no"
        className="font-display font-bold uppercase leading-[0.95] tracking-[0.02em] text-white"
        style={{
          fontSize: "clamp(2.75rem, 9vw, 6rem)",
          textWrap: "balance",
          textShadow: "0 2px 48px rgba(0,0,20,0.7)",
        }}
      >
        <MaskedLine delay={0.05} reduce={reduce}>
          Miras Capital
        </MaskedLine>
      </h1>
      <p
        className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/80 sm:text-xl"
        style={{ textShadow: "0 1px 24px rgba(0,0,20,0.85)" }}
      >
        <MaskedLine delay={0.22} reduce={reduce}>
          Providing Independent Advice.
        </MaskedLine>
        <MaskedLine delay={0.34} reduce={reduce}>
          Investing in Shared Ambitions.
        </MaskedLine>
      </p>
    </div>
  )
}
