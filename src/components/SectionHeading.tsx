import { Reveal } from "./Reveal"

/**
 * One consistent section header across the whole page: a short orange brand
 * rule + a large display headline (Josefin). This replaces the old repeated
 * tiny-uppercase-eyebrow + full-width-hairline pattern, giving every section a
 * real typographic anchor on a single scale. Reveals on scroll.
 */
export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Reveal className={className}>
      <span className="block h-[3px] w-10 rounded-full bg-orange" />
      <h2 className="mt-6 max-w-[20ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance text-white sm:text-5xl">
        {children}
      </h2>
    </Reveal>
  )
}
