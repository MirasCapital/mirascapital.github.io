import { Reveal } from "./Reveal"

/**
 * One consistent section header: a short orange brand rule + a large serif
 * display headline (Instrument Serif). Currently unused — the page composes
 * its own eyebrow + serif h2 pattern inline. Reveals on scroll.
 */
export function SectionHeading({
  children,
  className,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  once?: boolean
}) {
  return (
    <Reveal className={className} once={once}>
      <span className="block h-[3px] w-10 rounded-full bg-accent" />
      <h2 className="mt-6 max-w-[20ch] font-serif text-[2.5rem] leading-[1.05] tracking-[-0.01em] text-balance text-white sm:text-[3.3rem]">
        {children}
      </h2>
    </Reveal>
  )
}
