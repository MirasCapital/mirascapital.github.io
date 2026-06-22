import { ImmersiveBackground } from "@/components/ImmersiveBackground"
import { ContactForm } from "@/components/ContactForm"
import { TransactionCards, type Deal } from "@/components/TransactionCards"
import { SectionHeading } from "@/components/SectionHeading"
import { HeroText } from "@/components/HeroText"
import { Reveal } from "@/components/Reveal"
import { SiteNav } from "@/components/SiteNav"
import { Parallax } from "@/components/Parallax"
import { Stats, type Stat } from "@/components/Stats"
import { ScrollCue } from "@/components/ScrollCue"

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

// ── About stats ──────────────────────────────────────────────────────────────
// Figures supplied by the client (Nihat, Jun 2026).
const stats: Stat[] = [
  { value: 50, suffix: "+", label: "Deals advised" },
  { value: 15, suffix: "+", label: "Years of experience" },
  { value: 5, suffix: "+", label: "Industry sectors" },
]

export default function Home() {
  return (
    <main className="relative text-white">
      <SiteNav />

      {/* Persistent flow-field scene + scrims behind every stage. */}
      <ImmersiveBackground />

      {/* Each section is a full-viewport stage; its content animates in as the
          stage arrives and out as it leaves (Reveal `once={false}`). Scrolling
          is free and smooth (Lenis), no snapping. */}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative z-10 flex min-h-[100svh] items-center px-6"
      >
        <div className="mx-auto w-full max-w-6xl">
          <HeroText />
        </div>
        <ScrollCue />
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative z-10 flex min-h-[100svh] items-center px-6 py-24"
      >
        <div className="mx-auto w-full max-w-6xl">
          <Parallax from={28} to={-28}>
            <SectionHeading once={false} className="mb-10">
              Independent advice, aligned interests.
            </SectionHeading>
          </Parallax>
          <Reveal once={false} delay={0.08} className="max-w-3xl space-y-6">
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
          <Stats stats={stats} once={false} />
        </div>
      </section>

      {/* ── RECENT TRANSACTIONS ──────────────────────────────────────────── */}
      <section
        id="transactions"
        className="relative z-10 flex min-h-[100svh] items-center px-6 py-24"
      >
        <div className="mx-auto w-full max-w-6xl">
          <Parallax from={24} to={-24}>
            <SectionHeading once={false} className="mb-10">
              Recent transactions
            </SectionHeading>
          </Parallax>
          <TransactionCards transactions={transactions} />
        </div>
      </section>

      {/* ── CONTACT (+ footer share the closing stage) ───────────────────── */}
      <section
        id="contact"
        className="relative z-10 flex min-h-[100svh] flex-col px-6"
      >
        <div className="flex flex-1 items-center py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <Parallax from={20} to={-20}>
                <SectionHeading once={false}>
                  Your first move shapes the game.
                </SectionHeading>
              </Parallax>
              <Reveal once={false} delay={0.08}>
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
        </div>

        <footer className="-mx-6 mt-auto border-t border-white/10 px-6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-white/45 sm:flex-row">
            <span>© {new Date().getFullYear()} Miras Capital</span>
            <span>Independent advisory &amp; investment</span>
          </div>
        </footer>
      </section>
    </main>
  )
}
