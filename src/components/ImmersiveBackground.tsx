"use client"

import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useCallback, useState } from "react"

const SUNSET_SEQUENCE_WEBM = "/harbour-animation/harbour-sunset-transition.webm?v=locked-30fps-1"
const SUNSET_SEQUENCE_MP4 = "/harbour-animation/harbour-sunset-transition.mp4?v=locked-30fps-1"
const EVENING_LOOP_WEBM = "/harbour-animation/harbour-evening-loop.webm?v=locked-30fps-1"
const EVENING_LOOP_MP4 = "/harbour-animation/harbour-evening-loop.mp4?v=locked-30fps-1"
const SUNSET_POSTER = "/miras-sydney-harbour-sunset.png"
const STATIC_FALLBACK = "/miras-sydney-harbour-evening.png"

type ScenePhase = "sunset" | "evening"

export function ImmersiveBackground() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<ScenePhase>("sunset")
  const [animationFailed, setAnimationFailed] = useState(false)
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.14, 0.22], [1, 0.92, 0])

  const handleSequenceEnded = useCallback(() => setPhase("evening"), [])

  return (
    <motion.div
      aria-hidden
      style={{ opacity: sceneOpacity }}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07111c]"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {reduce || animationFailed ? (
            <Image
              src={STATIC_FALLBACK}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <>
              <video
                poster={STATIC_FALLBACK}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className={`absolute inset-0 h-full w-full object-cover object-center ${phase === "evening" ? "opacity-100" : "opacity-0"}`}
                onError={() => setAnimationFailed(true)}
              >
                <source src={EVENING_LOOP_WEBM} type="video/webm" />
                <source src={EVENING_LOOP_MP4} type="video/mp4" />
              </video>
              <video
                poster={SUNSET_POSTER}
                autoPlay
                muted
                playsInline
                preload="auto"
                className={`absolute inset-0 h-full w-full object-cover object-center ${phase === "sunset" ? "opacity-100" : "opacity-0"}`}
                onEnded={handleSequenceEnded}
                onError={() => setAnimationFailed(true)}
              >
                <source src={SUNSET_SEQUENCE_WEBM} type="video/webm" />
                <source src={SUNSET_SEQUENCE_MP4} type="video/mp4" />
              </video>
            </>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,19,0.2)_0%,rgba(2,10,19,0.06)_38%,rgba(2,10,19,0.5)_100%),radial-gradient(ellipse_at_52%_42%,transparent_34%,rgba(0,8,17,0.28)_100%)]" />
    </motion.div>
  )
}
