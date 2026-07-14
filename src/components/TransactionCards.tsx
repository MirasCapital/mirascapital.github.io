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

function Tombstone({ deal }: { deal: Deal }) {
  return (
    <article className="group flex h-full min-h-[330px] flex-col bg-white p-7 text-ink shadow-[0_24px_70px_rgba(0,0,0,0.2)] ring-1 ring-ink/5 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={deal.logo} alt={deal.alt} className="h-20 w-auto max-w-[200px] object-contain" />
        <span className="text-center text-sm italic text-neutral-500">{deal.type}</span>
        {deal.counter && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deal.counter}
            alt={deal.counterAlt ?? ""}
            className="h-[72px] w-auto max-w-[180px] object-contain"
          />
        )}
      </div>
      <div className="mt-6 flex items-center justify-center border-t border-ink/8 pt-5">
        <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-neutral-400">
          {deal.year}
        </span>
      </div>
    </article>
  )
}

function MobileCarousel({ transactions }: { transactions: Deal[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const loop = [...transactions, ...transactions, ...transactions]

  useEffect(() => {
    const element = ref.current
    if (!element) return
    let block = element.scrollWidth / 3
    let locked = false

    const recenter = () => {
      block = element.scrollWidth / 3
      if (block <= 0) return
      locked = true
      element.scrollLeft = block
      requestAnimationFrame(() => { locked = false })
    }
    recenter()

    let raf = 0
    const onScroll = () => {
      if (locked) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = element.scrollLeft
        if (x < block * 0.5) element.scrollLeft = x + block
        else if (x > block * 2.5) element.scrollLeft = x - block
      })
    }

    element.addEventListener("scroll", onScroll, { passive: true })
    const observer = new ResizeObserver(recenter)
    observer.observe(element)
    return () => {
      element.removeEventListener("scroll", onScroll)
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [transactions.length])

  return (
    <div
      ref={ref}
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
    >
      {loop.map((deal, index) => (
        <div key={`${deal.alt}-${index}`} className="w-[270px] shrink-0 snap-center snap-always">
          <Tombstone deal={deal} />
        </div>
      ))}
    </div>
  )
}

export function TransactionCards({ transactions }: { transactions: Deal[] }) {
  const reduce = useReducedMotion()

  return (
    <div className="mt-16 lg:mt-24">
      <MobileCarousel transactions={transactions} />
      <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {transactions.map((deal, index) => (
          <motion.div
            key={deal.alt}
            className="w-full"
            initial={{ opacity: 0, transform: "translateY(18px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduce ? { duration: 0 } : { duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <Tombstone deal={deal} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
