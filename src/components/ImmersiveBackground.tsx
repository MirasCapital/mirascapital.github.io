"use client"

import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

export function ImmersiveBackground() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.14, 0.22], [1, 0.92, 0])
  const sceneScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.035])

  return (
    <motion.div
      aria-hidden
      style={{ opacity: sceneOpacity }}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07111c]"
    >
      <motion.div
        style={reduce ? undefined : { scale: sceneScale }}
        className="absolute inset-0 origin-center"
      >
        <motion.div
          animate={reduce ? undefined : { transform: ["scale(1)", "scale(1.02)", "scale(1)"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 origin-center"
        >
          <Image
            src="/miras-sydney-harbour.png"
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,19,0.2)_0%,rgba(2,10,19,0.06)_38%,rgba(2,10,19,0.5)_100%),radial-gradient(ellipse_at_52%_42%,transparent_34%,rgba(0,8,17,0.28)_100%)]" />
    </motion.div>
  )
}
