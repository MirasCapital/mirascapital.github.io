import { FlowField } from "@/components/FlowField"
import { ContactForm } from "@/components/ContactForm"
import { TransactionCards, type Deal } from "@/components/TransactionCards"
import { SectionHeading } from "@/components/SectionHeading"
import { HeroText } from "@/components/HeroText"
import { Reveal } from "@/components/Reveal"
import { SiteNav } from "@/components/SiteNav"

// ── Recent Transactions ──────────────────────────────────────────────────────
// Rendered as white "tombstone" cards so the client logos read cleanly on the
// dark page. `counter` is the second party (acquirer/target) where relevant.
const transactions: Deal[] = [
  {
    logo: "/Deals/Monarch.png",
    alt: "Monarch Mental Health Group",
    type: "Rights Issue",
    year: "2024",
  },
  {
    logo: "/Deals/Wyntec.png",
    alt: "Wyntec",
    type: "has been acquired by",
    counter: "/Deals/Canary.png",
    counterAlt: "Canary Technology Solutions",
    year: "2024",
  },
  {
    logo: "/Deals/PowerPlay.png",
    alt: "PowerPlay",
    type: "Strategic Advice",
    year: "2025",
  },
  {
    logo: "/Deals/Eureka.png",
    alt: "Eureka Pet Co.",
    type: "has acquired",
    counter: "/Deals/MRPF.png",
    counterAlt: "Murray River Pet Food",
    year: "2025",
  },
]

export default function Home() {
  return (
    <main className="bg-navy-deep text-white">
      <SiteNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
        // Matches the WebGL scene's own gradient so the canvas fades in
        // seamlessly over it (no flash before first paint).
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 64% 26%, #11407a 0%, #08203f 40%, #030c1c 72%, #000014 105%)",
        }}
      >
        <FlowField
          className="absolute inset-0 h-full w-full"
          style={{ position: "absolute", inset: 0 }}
        />

        {/* Legibility scrims — text sits over darkness on the left/bottom while
            the flow stays vivid on the right (matches the tools-site layout). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-navy-deep to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy/80 to-transparent"
        />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6">
          <HeroText />
        </div>
      </section>

      {/* Sections flow dark navy → navy → dark navy down the page. */}
      <div
        style={{
          background:
            "linear-gradient(180deg, #0a1722 0%, #16364f 50%, #0a1722 100%)",
        }}
      >
        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <section id="about" className="scroll-mt-20 px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <SectionHeading className="mb-12">
            Independent advice, aligned interests.
          </SectionHeading>
          <Reveal delay={0.08} className="max-w-3xl space-y-6">
            <p className="text-xl font-light leading-relaxed text-white/85 sm:text-2xl">
              Miras Capital is an independent advisory and investment firm
              specialising in mergers &amp; acquisitions, capital raisings,
              industry roll-ups and strategic advisory services.
            </p>
            <p className="text-lg font-light leading-relaxed text-white/65 sm:text-xl">
              We provide comprehensive advice to businesses across various
              sectors of the Australian economy, combining deep industry
              expertise with senior-level attention to deliver exceptional
              outcomes.
            </p>
            <p className="text-lg font-light leading-relaxed text-white/65 sm:text-xl">
              We prioritise aligned interests, offering flexible fee structures
              that often include equity participation, fostering long-term
              trusted-advisor partnerships.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── RECENT TRANSACTIONS ──────────────────────────────────────────── */}
      <section
        id="transactions"
        className="scroll-mt-20 px-6 py-28 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading className="mb-12">Recent transactions</SectionHeading>
          <TransactionCards transactions={transactions} />
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="flex min-h-[100svh] scroll-mt-16 items-center px-6 py-24"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <SectionHeading>Your first move shapes the game.</SectionHeading>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
                Tell us your goals, and together we&apos;ll help you make them
                happen.
              </p>
            </Reveal>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-white/45 sm:flex-row">
          <span>© {new Date().getFullYear()} Miras Capital</span>
          <span>Independent advisory &amp; investment</span>
        </div>
      </footer>
      </div>
    </main>
  )
}
