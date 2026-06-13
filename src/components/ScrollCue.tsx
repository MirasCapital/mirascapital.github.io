"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

/**
 * Quiet "scroll" hint at the foot of the hero: a thin rail with a dot that
 * drifts down on a loop, plus a label. It fades out over the first quarter of
 * a scroll, so it signals the page pages without lingering. The travelling dot
 * is stilled under reduced motion (the fade still applies).
 */
export function ScrollCue() {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const [vh, setVh] = useState(900)

  useEffect(() => {
    const set = () => setVh(window.innerHeight)
    set()
    window.addEventListener("resize", set)
    return () => window.removeEventListener("resize", set)
  }, [])

  const opacity = useTransform(scrollY, [0, vh * 0.25], [1, 0])

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 text-white/50"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
        Scroll
      </span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/20">
        <motion.span
          className="absolute left-0 top-0 block h-3 w-px bg-white/80"
          animate={reduce ? undefined : { y: [-12, 40] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </span>
    </motion.div>
  )
}
