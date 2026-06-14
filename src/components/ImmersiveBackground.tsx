"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

/**
 * The persistent scene behind the whole page: a muted, looping B&W harbour
 * video (the real aerial footage). `muted` + `playsInline` satisfy autoplay
 * policy and the "no sound" requirement; the audio is never played.
 *
 * A constant left gradient keeps left-aligned text legible; a scroll-driven
 * dark veil deepens as you leave the hero so content stages stay readable.
 * Under reduced motion the video is paused (a single still frame).
 */
export function ImmersiveBackground() {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [vh, setVh] = useState(900)

  useEffect(() => {
    const set = () => setVh(window.innerHeight)
    set()
    window.addEventListener("resize", set)
    return () => window.removeEventListener("resize", set)
  }, [])

  // The clip is the full harbour zoom-out, interpolated to 48fps and built as a
  // forward+reverse palindrome (seamless loop). We slow it overall and, instead
  // of a hard freeze at the wide "end" frame, smoothly ease the playback rate
  // down to a near-stop there and back up — a judder-free, decelerating pause.
  // (A still frame ramp via playbackRate, not a CSS hold, so the video itself
  // settles.) Reduced motion just pauses on a frame.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    if (reduce) {
      v.pause()
      return
    }

    const BASE = 0.5 // overall slow drift
    const DEEP = 0.07 // near-stop at the pause
    const RAMP = 1.5 // video-seconds each side of the wide frame to ease over

    let raf = 0
    const tick = () => {
      const dur = v.duration
      if (dur && isFinite(dur)) {
        const mid = dur / 2 // the wide "end" frame (forward→reverse turnaround)
        const d = Math.abs(v.currentTime - mid)
        let rate = BASE
        if (d < RAMP) {
          const k = d / RAMP
          const eased = k * k * (3 - 2 * k) // smoothstep
          rate = DEEP + (BASE - DEEP) * eased
        }
        v.playbackRate = Math.max(0.05, rate)
      }
      raf = requestAnimationFrame(tick)
    }
    void v.play().catch(() => {})
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  const veil = useTransform(scrollY, [0, vh * 0.85], [0.12, 0.62])

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="cam absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // eslint-disable-next-line jsx-a11y/media-has-caption
          src="/bridge.mp4"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-r from-black via-black/55 to-transparent"
      />
      <motion.div
        aria-hidden
        style={{ opacity: veil }}
        className="pointer-events-none fixed inset-0 z-0 bg-black"
      />
    </>
  )
}
