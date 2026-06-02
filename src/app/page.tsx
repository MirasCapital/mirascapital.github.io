import { FlowField } from "@/components/FlowField"
import { ContactForm } from "@/components/ContactForm"

// ── Recent Transactions ──────────────────────────────────────────────────────
// Rendered as white "tombstone" cards so the client logos read cleanly on the
// dark page. `counter` is the second party (acquirer/target) where relevant.
type Deal = {
  logo: string
  alt: string
  type: string
  counter?: string
  counterAlt?: string
  year: string
}

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
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
        // Matches the WebGL scene's own gradient so the canvas fades in
        // seamlessly over it (no flash before first paint).
        style={{
          background:
            "radial-gradient(ellipse 62% 55% at 50% 16%, #0e4159 0%, #0b2639 40%, #071826 70%, #051019 105%)",
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
          <header className="flex items-center justify-end py-6">
            <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              <a
                href="#about"
                className="hidden transition-colors hover:text-white sm:inline"
              >
                About
              </a>
              <a
                href="#transactions"
                className="hidden transition-colors hover:text-white sm:inline"
              >
                Transactions
              </a>
              <a href="#contact" className="transition-colors hover:text-white">
                Contact
              </a>
            </nav>
          </header>

          <div className="flex flex-1 flex-col justify-center pb-28">
            <h1
              translate="no"
              className="font-display font-bold uppercase leading-[0.95] tracking-[0.02em] text-white"
              style={{
                fontSize: "clamp(2.75rem, 9vw, 6rem)",
                textWrap: "balance",
                textShadow: "0 2px 48px rgba(0,0,20,0.7)",
              }}
            >
              Miras Capital
            </h1>
            <p
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/80 sm:text-xl"
              style={{ textShadow: "0 1px 24px rgba(0,0,20,0.85)" }}
            >
              Providing Independent Advice.
              <br />
              Investing in Shared Ambitions.
            </p>
          </div>

          {/* Scroll cue */}
          <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white/40">
              Scroll
            </span>
          </div>
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
          <div className="mb-12 flex items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-orange">
              About
            </h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="max-w-3xl space-y-6 text-lg font-light leading-relaxed text-white/80 sm:text-xl">
            <p>
              Miras Capital is an independent advisory and investment firm
              specialising in mergers &amp; acquisitions, capital raisings,
              industry roll-ups and strategic advisory services.
            </p>
            <p>
              We provide comprehensive advice to businesses across various
              sectors of the Australian economy, combining deep industry
              expertise with senior-level attention to deliver exceptional
              outcomes.
            </p>
            <p>
              We prioritise aligned interests, offering flexible fee structures
              that often include equity participation, fostering long-term
              trusted-advisor partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* ── RECENT TRANSACTIONS ──────────────────────────────────────────── */}
      <section
        id="transactions"
        className="scroll-mt-20 px-6 py-28 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-orange">
              Recent Transactions
            </h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {transactions.map((deal) => (
              <article
                key={deal.alt}
                className="group flex min-h-[300px] flex-col rounded-2xl bg-white p-8 shadow-xl shadow-black/30 ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="flex flex-1 flex-col items-center justify-center gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={deal.logo}
                    alt={deal.alt}
                    className="h-14 w-auto max-w-[160px] object-contain"
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
                        className="h-12 w-auto max-w-[150px] object-contain"
                      />
                    </>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {deal.year}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-20 px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-orange">
              Contact
            </h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <p className="text-3xl font-light leading-snug text-white/90 sm:text-4xl">
                Your first move shapes the game.
              </p>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
                Tell us your goals, and together we&apos;ll help you make them
                happen.
              </p>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-white/45 sm:flex-row">
          <span className="font-display uppercase tracking-[0.24em] text-white/60">
            Miras Capital
          </span>
          <span>
            © {new Date().getFullYear()} Miras Capital · Independent advisory
            &amp; investment
          </span>
        </div>
      </footer>
      </div>
    </main>
  )
}
