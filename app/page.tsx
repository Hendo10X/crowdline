"use client"

import Link from "next/link"
import { Globe } from "@/components/globe"
import { MOCK_EVENTS } from "@/lib/bayse"
import { Landmark, Trophy, TrendingUp, Briefcase, Building2 } from "lucide-react"

const STEPS = [
  {
    number: "01",
    title: "Connect to GoWagr",
    body: "We pull live prediction market data from Bayse Markets — prices, probabilities, and trader counts, refreshed every 30 seconds.",
  },
  {
    number: "02",
    title: "Drop in one line",
    body: "Publishers paste a single <script> tag or iframe into their CMS. No SDK. No engineering ticket.",
  },
  {
    number: "03",
    title: "Readers see conviction",
    body: "A live widget renders inside the article — not an opinion, not a poll, but what thousands of people are staking real money on.",
  },
]

const CATEGORIES = [
  { label: "Politics", icon: Landmark },
  { label: "Sports", icon: Trophy },
  { label: "Economy", icon: TrendingUp },
  { label: "Business", icon: Briefcase },
  { label: "Infrastructure", icon: Building2 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#101010] text-[#f0ede6]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#101010]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-widest text-[#f0ede6]">CROWDLINE</span>
            <span className="rounded border border-[#2a2a2a] px-1.5 py-0.5 font-mono text-[9px] text-[#444] uppercase tracking-widest">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="font-mono text-xs text-[#555] uppercase tracking-widest transition-colors hover:text-[#f0ede6]"
            >
              About us
            </Link>
            <Link
              href="/dashboard"
              className="font-mono text-xs text-[#555] uppercase tracking-widest transition-colors hover:text-[#f0ede6]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center rounded-full bg-[#1369F1] px-4 font-mono text-xs font-semibold text-white hover:bg-[#0f57d4] uppercase tracking-wider transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden px-6 pt-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row md:items-center md:gap-8 lg:gap-12">

          {/* Left — text */}
          <div className="relative z-10 flex flex-col pt-16 pb-4 text-center md:w-[48%] md:py-0 md:text-left lg:w-[45%]">
            {/* Badge */}
            <div className="mb-8 inline-flex w-fit mx-auto items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#161616] px-3 py-1 md:mx-0">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-[10px] text-[#555] tracking-wider uppercase">Live market data</span>
            </div>

            <h1
              className="mb-6 text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 700 }}
            >
              <span className="text-[#f0ede6]">Live conviction.</span>
              <br />
              <span className="text-[#1369F1]">Embedded.</span>
            </h1>

            <p className="mb-10 mx-auto max-w-sm text-sm leading-relaxed text-[#555] md:mx-0 md:max-w-md md:text-base">
              Drop one line of code. Your readers see what{" "}
              <span className="text-[#999]">thousands of people are betting on</span>
              , right next to the story they&apos;re already reading.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href="/dashboard"
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#1369F1] px-6 font-mono text-xs font-semibold text-white hover:bg-[#0f57d4] uppercase tracking-wider transition-colors sm:w-auto"
              >
                Browse markets →
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#2a2a2a] bg-transparent px-6 font-mono text-xs text-[#555] hover:border-[#3a3a3a] hover:bg-[#161616] hover:text-[#f0ede6] uppercase tracking-wider transition-colors sm:w-auto"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Right — globe (visible on all sizes) */}
          <div className="flex flex-1 items-center justify-center py-8 md:py-0">
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-none">
              <div className="absolute inset-0 rounded-full bg-[#1369F1] opacity-[0.05] blur-3xl scale-75 pointer-events-none" />
              <Globe className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker strip */}
      <div className="border-y border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden py-3">
        <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap">
          {[...MOCK_EVENTS, ...MOCK_EVENTS].map((e, i) => {
            const pct = Math.round((e.markets[0].outcomes[0].price ?? 0.5) * 100)
            return (
              <span key={i} className="inline-flex items-center gap-3 font-mono text-xs text-[#444]">
                <span className="text-[#666]">{e.title}</span>
                <span className={pct >= 50 ? "text-[#22c55e]" : "text-[#ef4444]"}>{pct}%</span>
                <span className="text-[#2a2a2a]">·</span>
              </span>
            )
          })}
        </div>
        <style>{`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mb-16">
          <p className="mb-3 font-mono text-xs text-[#1369F1] uppercase tracking-widest">How it works</p>
          <h2
            className="text-3xl text-[#f0ede6] md:text-4xl"
            style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 700 }}
          >
            Three steps to live market data
            <br />
            inside your content.
          </h2>
        </div>

        <div className="grid gap-px bg-[#1a1a1a] md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group bg-[#101010] p-8 transition-colors hover:bg-[#0d0d0d]"
            >
              <div className="mb-6 font-mono text-5xl font-light text-[#1e1e1e] transition-colors group-hover:text-[#2a2a2a]">
                {step.number}
              </div>
              <h3
                className="mb-3 text-lg text-[#f0ede6]"
                style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 600 }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#555]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What publishers get */}
      <section className="border-y border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-xs text-[#1369F1] uppercase tracking-widest">For publishers</p>
              <h2
                className="mb-6 text-3xl text-[#f0ede6] md:text-4xl"
                style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 700 }}
              >
                Your readers trust numbers
                <br />
                more than pundits.
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-[#555]">
                When TechCabal covers the 2027 election, Crowdline puts a live probability right inside the
                article. Not a Twitter poll. Not an expert quote. Thousands of people with skin in the game.
              </p>
              <ul className="space-y-4">
                {[
                  "One embed tag — works in any CMS",
                  "Auto-updates every 30 seconds",
                  "Categories: Politics, Sports, Economy, Business",
                  "Custom colour and size options",
                  "Powered-by attribution to GoWagr",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#666]">
                    <span className="mt-0.5 text-[#1369F1]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Code snippet */}
            <div className="rounded-xl border border-[#1e1e1e] bg-[#101010] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#1e1e1e] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-[11px] text-[#444]">embed.html</span>
              </div>
              <pre className="overflow-x-auto p-6 text-[13px] leading-relaxed">
                <code>
                  <span className="text-[#555]">{"<!-- Drop this into your article -->"}</span>
                  {"\n\n"}
                  <span className="text-[#1369F1]">{"<script"}</span>
                  {"\n  "}
                  <span className="text-[#22c55e]">src</span>
                  <span className="text-[#f0ede6]">{"="}</span>
                  <span className="text-[#3b82f6]">{'"https://crowdline.io/widget.js"'}</span>
                  {"\n  "}
                  <span className="text-[#22c55e]">data-event</span>
                  <span className="text-[#f0ede6]">{"="}</span>
                  <span className="text-[#3b82f6]">{'"evt_tinubu_reelect"'}</span>
                  {"\n  "}
                  <span className="text-[#22c55e]">data-theme</span>
                  <span className="text-[#f0ede6]">{"="}</span>
                  <span className="text-[#3b82f6]">{'"dark"'}</span>
                  {"\n"}
                  <span className="text-[#1369F1]">{"></script>"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="mb-12">
          <p className="mb-3 font-mono text-xs text-[#1369F1] uppercase tracking-widest">Coverage</p>
          <h2
            className="text-3xl text-[#f0ede6]"
            style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 700 }}
          >
            What&apos;s being traded.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              href={`/dashboard?category=${label.toLowerCase()}`}
              className="group inline-flex items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#0d0d0d] px-5 py-2.5 font-mono text-sm text-[#555] transition-all hover:border-[#1369F1]/30 hover:bg-[#1369F1]/5 hover:text-[#1369F1]"
            >
              {label}
              <Icon
                className="h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="mx-auto max-w-6xl px-6 py-28 text-center">
          <p className="mb-3 font-mono text-xs text-[#1369F1] uppercase tracking-widest">Get started</p>
          <h2
            className="mb-6 text-4xl text-[#f0ede6] md:text-5xl"
            style={{ fontFamily: '"CalSans", system-ui, sans-serif', fontWeight: 700 }}
          >
            Your first embed is
            <br />
            <span className="text-[#1369F1]">free, forever.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm text-[#555] leading-relaxed">
            Browse live markets, copy the embed code, and drop it into your CMS. No account needed to preview.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-full bg-[#1369F1] px-6 font-mono text-sm font-semibold text-white hover:bg-[#0f57d4] uppercase tracking-wider transition-colors"
          >
            Browse markets →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-widest text-[#333] uppercase">Crowdline</span>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-[#333]">Powered by</span>
            <span className="font-mono text-[11px] font-semibold text-[#555]">Bayse Markets</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
