"use client"

import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

const SUNSET_SEQUENCE = "/harbour-animation/harbour-sunset-transition.webp"
const EVENING_LOOP = "/harbour-animation/harbour-evening-loop.webp"
const STATIC_FALLBACK = "/miras-sydney-harbour-evening.png"
const SUNSET_SEQUENCE_DURATION = 5_760

type ScenePhase = "sunset" | "evening"

export function ImmersiveBackground() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<ScenePhase>("sunset")
  const [animationFailed, setAnimationFailed] = useState(false)
  const sunsetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.14, 0.22], [1, 0.92, 0])
  const sceneScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.035])

  useEffect(() => {
    if (reduce) return
    const evening = new window.Image()
    evening.src = EVENING_LOOP

    return () => {
      if (sunsetTimer.current) clearTimeout(sunsetTimer.current)
    }
  }, [reduce])

  const handleSequenceLoaded = useCallback(() => {
    if (reduce || animationFailed || phase !== "sunset" || sunsetTimer.current) return
    sunsetTimer.current = setTimeout(() => {
      setPhase("evening")
      sunsetTimer.current = null
    }, SUNSET_SEQUENCE_DURATION)
  }, [animationFailed, phase, reduce])

  const sceneSource = reduce || animationFailed
    ? STATIC_FALLBACK
    : phase === "sunset"
      ? SUNSET_SEQUENCE
      : EVENING_LOOP

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
            key={sceneSource}
            src={sceneSource}
            alt=""
            fill
            priority
            unoptimized={!reduce && !animationFailed}
            sizes="100vw"
            className="object-cover object-center"
            onLoad={handleSequenceLoaded}
            onError={() => setAnimationFailed(true)}
          />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,19,0.2)_0%,rgba(2,10,19,0.06)_38%,rgba(2,10,19,0.5)_100%),radial-gradient(ellipse_at_52%_42%,transparent_34%,rgba(0,8,17,0.28)_100%)]" />
    </motion.div>
  )
}
