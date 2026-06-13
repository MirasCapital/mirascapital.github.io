"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"

export type Deal = {
  logo: string
  alt: string
  type: string
  counter?: string
  counterAlt?: string
  year: string
}

// The white tombstone card itself. Shared by the desktop grid and the mobile
// carousel so the two stay visually identical. Fixed height; the hover lift
// fires only on real pointers so it never sticks on a touch tap.
function Tombstone({ deal }: { deal: Deal }) {
  return (
    <article className="group flex h-full min-h-[330px] flex-col rounded-2xl bg-white p-7 shadow-xl shadow-black/30 ring-1 ring-black/5 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1.5">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deal.logo}
          alt={deal.alt}
          className="h-20 w-auto max-w-[200px] object-contain"
        />
        <span className="text-center text-sm italic text-neutral-500">
          {deal.type}
        </span>
        {deal.counter && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={deal.counter}
              alt={deal.counterAlt}
              className="h-[72px] w-auto max-w-[180px] object-contain"
            />
          </>
        )}
      </div>
      <div className="mt-6 flex items-center justify-center">
        <span className="text-xs font-normal uppercase tracking-[0.2em] text-neutral-400">
          {deal.year}
        </span>
      </div>
    </article>
  )
}

/**
 * Endless mobile carousel.
 *
 * The deals are rendered three times in a row and the track starts centered on
 * the middle copy. As the user swipes, we silently recenter (`scrollLeft -/+`
 * one block) once they drift into an outer copy, so swiping never hits an end
 * in either direction. The recenter is instant and the copies are identical, so
 * the seam is invisible.
 *
 * Cards are a FIXED width (not a % of the viewport), so the card size and the
 * peek of the neighbours feel the same on every phone. The scroll handler is
 * scoped to this element and only reads/writes `scrollLeft` (no React state on
 * scroll), so it stays cheap.
 */
function MobileCarousel({ transactions }: { transactions: Deal[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const loop = [...transactions, ...transactions, ...transactions]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let block = el.scrollWidth / 3
    let lock = false

    const recenter = () => {
      block = el.scrollWidth / 3
      if (block <= 0) return
      lock = true
      el.scrollLeft = block // park on the middle copy
      requestAnimationFrame(() => {
        lock = false
      })
    }
    recenter()

    let raf = 0
    const onScroll = () => {
      if (lock) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (block <= 0) return
        const x = el.scrollLeft
        if (x < block * 0.5) el.scrollLeft = x + block
        else if (x > block * 2.5) el.scrollLeft = x - block
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(recenter)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [transactions.length])

  return (
    <div
      ref={ref}
      className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
    >
      {loop.map((deal, i) => (
        <div key={i} className="w-[270px] shrink-0 snap-center snap-always">
          <Tombstone deal={deal} />
        </div>
      ))}
    </div>
  )
}

/**
 * Transaction tombstones: an endless swipe carousel on mobile, a staggered
 * scroll-reveal grid from `sm` up. Each grid card fades + lifts in the first
 * time it enters the viewport (Motion `whileInView`), staggered left to right;
 * reduced-motion renders the final state with no movement.
 */
export function TransactionCards({ transactions }: { transactions: Deal[] }) {
  const reduce = useReducedMotion()

  return (
    <>
      <MobileCarousel transactions={transactions} />

      <div className="hidden justify-items-center gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {transactions.map((deal, i) => (
          <motion.div
            key={deal.alt}
            className="w-full max-w-[300px]"
            // Initial state must not branch on `reduce` (the server can't
            // know it — branching causes a hydration mismatch); reduced
            // motion collapses to a zero-duration snap instead.
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <Tombstone deal={deal} />
          </motion.div>
        ))}
      </div>
    </>
  )
}
