import Image from "next/image"
import { ContactForm } from "@/components/ContactForm"
import { HeroText } from "@/components/HeroText"
import { ImmersiveBackground } from "@/components/ImmersiveBackground"
import { Reveal } from "@/components/Reveal"
import { SiteNav } from "@/components/SiteNav"
import { Stats, type Stat } from "@/components/Stats"
import { TransactionCards, type Deal } from "@/components/TransactionCards"

const transactions: Deal[] = [
  { logo: "/Deals/Monarch.png", alt: "Monarch Mental Health Group", type: "Rights Issue", year: "2024" },
  {
    logo: "/Deals/Wyntec.png",
    alt: "Wyntec",
    type: "has been acquired by",
    counter: "/Deals/Canary.png",
    counterAlt: "Canary Technology Solutions",
    year: "2024",
  },
  { logo: "/Deals/PowerPlay.png", alt: "PowerPlay", type: "Strategic Advice", year: "2025" },
  {
    logo: "/Deals/Eureka.png",
    alt: "Eureka Pet Co.",
    type: "has acquired",
    counter: "/Deals/MRPF.png",
    counterAlt: "Murray River Pet Food",
    year: "2025",
  },
]

const stats: Stat[] = [
  { value: 50, suffix: "+", label: "Deals advised" },
  { value: 5, prefix: "$", suffix: "b+", label: "Deal value" },
  { value: 15, suffix: "+", label: "Years of experience" },
  { value: 5, suffix: "+", label: "Industry sectors" },
]

const advisoryServices = [
  {
    title: "Mergers & acquisitions",
    body: "Senior-led advice across acquisitions and divestments, from the first strategic question through to completion.",
  },
  {
    title: "Capital raisings",
    body: "Clear advice on capital structure, investor engagement and the transaction process required to fund the next stage.",
  },
  {
    title: "Industry roll-ups & strategic advice",
    body: "Commercial judgement for consolidation, ownership, growth and the decisions that shape long-term enterprise value.",
  },
]

export default function Home() {
  return (
    <main className="relative overflow-clip bg-ink text-cloud">
      <SiteNav />
      <ImmersiveBackground />

      <section id="top" className="relative z-10 min-h-[100dvh] px-5 pb-10 pt-20 sm:px-8 sm:pb-12 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <HeroText />
        </div>
      </section>

      <section id="about" className="relative z-10 bg-ink px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44">
        <div className="mx-auto max-w-[1440px]">
          <Reveal className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="mb-8 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
                About Miras
              </p>
              <h2 className="max-w-[13ch] font-serif text-[3.3rem] leading-[1.04] tracking-[-0.01em] text-balance sm:text-[5rem] lg:text-[6.9rem]">
                Independent advice. Aligned interests.
              </h2>
            </div>
            <div className="flex flex-col justify-end lg:col-span-4 lg:col-start-9 lg:pb-2">
              <p className="text-xl leading-relaxed text-cloud/72 sm:text-2xl">
                We work alongside business owners, boards and investors when the decisions carry lasting consequences, bringing senior attention, commercial judgement and an investor mindset to every engagement.
              </p>
              <p className="mt-7 text-xl leading-relaxed text-cloud/72 sm:text-2xl">
                Our advice is shaped around each business and its ambitions, with experienced involvement from the first strategic question through to completion.
              </p>
            </div>
          </Reveal>

          <Stats stats={stats} />
        </div>
      </section>

      <section className="relative z-10 bg-ink px-5 pb-28 sm:px-8 sm:pb-36 lg:px-12 lg:pb-44">
        <div className="mx-auto grid max-w-[1440px] gap-12 border-t border-cloud/12 pt-10 lg:grid-cols-12 lg:gap-8 lg:pt-14">
          <Reveal className="relative min-h-[430px] overflow-hidden sm:min-h-[600px] lg:col-span-6 lg:min-h-[720px]">
            <Image
              src="/miras-opera-detail.png"
              alt="Architectural detail of the Sydney Opera House sails"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(5,8,11,0.55)_100%)]" />
            <span className="absolute bottom-5 left-5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cloud/62 sm:bottom-7 sm:left-7">
              Sydney / Built for the long term
            </span>
          </Reveal>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-14">
            <Reveal>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
                What we do
              </p>
              <h2 className="mt-7 max-w-[13ch] font-serif text-[2.5rem] leading-[1.05] tracking-[-0.01em] text-balance sm:text-[4.1rem]">
                <span className="whitespace-nowrap">Senior-led</span> advice. Investor mindset.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cloud/56">
                We bring direct, experienced judgement to consequential business decisions. Every engagement is shaped around the opportunity, never a standard template.
              </p>
            </Reveal>

            <div className="mt-14">
              {advisoryServices.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.06}>
                  <article className="capability-row border-t border-cloud/12 py-7 sm:grid sm:grid-cols-[1fr_1.2fr] sm:gap-8">
                    <h3 className="text-xl font-medium tracking-[-0.025em] sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-cloud/50 sm:mt-0">{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="transactions" className="relative z-10 bg-smoke px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44">
        <div className="mx-auto max-w-[1440px]">
          <Reveal className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="mb-8 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
                Selected experience
              </p>
              <h2 className="max-w-[12ch] font-serif text-[3.3rem] leading-[1.05] tracking-[-0.01em] text-balance sm:text-[5rem]">
                Recent transactions.
              </h2>
            </div>
            <p className="max-w-md self-end text-base leading-relaxed text-cloud/50 lg:col-span-3 lg:col-start-10">
              Selected work across mergers and acquisitions, capital raisings and strategic advice.
            </p>
          </Reveal>

          <TransactionCards transactions={transactions} />
        </div>
      </section>

      <section className="relative z-10 bg-ink px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <p className="mb-8 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
              Aligned interests
            </p>
            <h2 className="max-w-[13ch] font-serif text-[3.3rem] leading-[1.05] tracking-[-0.01em] text-balance sm:text-[5rem]">
              Advice built around the outcome.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:pt-28">
            <p className="text-xl leading-relaxed text-cloud/70">
              We prioritise aligned interests and long-term trusted-advisor partnerships.
            </p>
            <p className="mt-7 text-xl leading-relaxed text-cloud/70">
              Our flexible fee structures often include equity participation, keeping our interests connected to the value created beyond a transaction.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="relative z-10 bg-smoke px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12 lg:pt-44">
        <div className="mx-auto grid max-w-[1440px] gap-16 border-b border-cloud/12 pb-28 lg:grid-cols-12 lg:gap-8 lg:pb-36">
          <Reveal className="lg:col-span-6">
            <p className="mb-8 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
              Start a conversation
            </p>
            <h2 className="max-w-[10ch] font-serif text-[3.3rem] leading-[1.05] tracking-[-0.01em] text-balance sm:text-[5rem]">
              Your first move shapes the game.
            </h2>
            <p className="mt-9 max-w-sm text-sm leading-relaxed text-cloud/48">
              Tell us your goals, and together we&apos;ll help you make them happen.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8 lg:pt-4">
            <ContactForm />
          </Reveal>
        </div>

        <footer className="mx-auto flex max-w-[1440px] flex-col gap-5 py-8 text-xs text-cloud/42 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Miras Capital</span>
          <div className="flex gap-6">
            <span>Sydney, Australia</span>
            <a href="#top" className="transition-colors duration-200 hover:text-cloud">Back to top</a>
          </div>
        </footer>
      </section>
    </main>
  )
}
