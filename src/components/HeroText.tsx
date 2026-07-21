"use client"

import { ArrowDownRight } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

export function HeroText() {
  const reduce = useReducedMotion() ?? false
  const transition = (delay: number) =>
    reduce ? { duration: 0 } : { duration: 0.9, delay, ease: EASE }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col justify-between pt-[18vh] sm:pt-[16vh]">
      <div>
        <div className="pb-[0.08em] text-center">
          <motion.h1
            translate="no"
            initial={{ opacity: 0, transform: "translateY(24px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={transition(0.06)}
            className="whitespace-nowrap font-display text-[clamp(2.6rem,8.25vw,9rem)] font-bold uppercase leading-[0.9] tracking-[0.012em] text-cloud"
          >
            Miras Capital
          </motion.h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, transform: "translateY(18px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={transition(0.36)}
        className="grid gap-7 border-y border-cloud/20 bg-black/15 px-5 py-6 backdrop-blur-[4px] sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8"
      >
        <p className="font-serif text-[1.55rem] leading-[1.08] tracking-[-0.01em] text-cloud sm:text-[2.05rem] lg:col-span-6 lg:text-[2.5rem]">
          <span className="block whitespace-nowrap">Providing independent advice.</span>
          <span className="block whitespace-nowrap">Investing in shared ambitions.</span>
        </p>

        <div className="sm:pl-4 lg:col-span-4 lg:col-start-8 lg:pl-0">
          <p className="max-w-[34rem] text-sm leading-relaxed text-cloud/76 sm:text-base">
            Miras Capital is an independent advisory and investment firm specialising in mergers and acquisitions, capital raisings, industry roll-ups and strategic advisory services.
          </p>
          <a
            href="#contact"
            className="group mt-6 inline-flex items-center gap-3 border-b border-accent pb-2 text-sm font-semibold text-cloud transition-colors duration-200 hover:text-accent active:translate-y-px"
          >
            Start a conversation
            <ArrowDownRight
              size={17}
              weight="bold"
              className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
