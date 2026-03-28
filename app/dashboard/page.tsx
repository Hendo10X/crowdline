"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { InlineWidget } from "@/components/widget/inline-widget"
import type { BayseEvent } from "@/lib/bayse"
import { MOCK_EVENTS } from "@/lib/bayse"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

const CATEGORIES = ["All", "Politics", "Sports", "Economy", "Business", "Infrastructure"]

const CATEGORY_COLORS: Record<string, string> = {
  Politics: "text-[#a855f7]",
  Sports: "text-[#22c55e]",
  Economy: "text-[#3b82f6]",
  Business: "text-[#1369F1]",
  Infrastructure: "text-[#ec4899]",
}

function formatTraders(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatVolume(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n}`
}

function MarketCard({
  event,
  onSelect,
}: {
  event: BayseEvent
  onSelect: (e: BayseEvent) => void
}) {
  const market = event.markets[0]
  const yesPct = Math.round((market.outcomes[0]?.price ?? 0.5) * 100)
  const change = market.outcomes[0]?.change ?? 0
  const changeAbs = Math.abs(change * 100).toFixed(1)
  const isUp = change > 0

  return (
    <button
      onClick={() => onSelect(event)}
      className="group w-full text-left rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-5 transition-all hover:border-[#2a2a2a] hover:bg-[#111] focus:outline-none focus:ring-1 focus:ring-[#1369F1]/30"
    >
      {/* Category + status */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase tracking-widest ${CATEGORY_COLORS[event.category ?? ""] ?? "text-[#666]"}`}
        >
          {event.category ?? "General"}
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-widest ${
            event.status === "open" ? "text-[#22c55e]" : "text-[#666]"
          }`}
        >
          {event.status}
        </span>
      </div>

      {/* Title */}
      <p className="mb-4 text-sm font-medium leading-snug text-[#f0ede6] line-clamp-2 group-hover:text-white transition-colors">
        {event.title}
      </p>

      {/* Mini probability bar */}
      <div className="mb-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-500"
            style={{ width: `${yesPct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xl font-semibold text-[#f0ede6]">{yesPct}%</span>
          <span
            className={`font-mono text-[11px] ${
              isUp ? "text-[#22c55e]" : "text-[#ef4444]"
            }`}
          >
            {isUp ? "+" : "-"}{changeAbs}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3 text-[#A1A1A1]">
          <span className="font-mono text-[11px]">{formatTraders(market.traderCount ?? 0)} traders</span>
          {market.volume !== undefined && (
            <>
              <span className="text-[#444]">·</span>
              <span className="font-mono text-[11px]">{formatVolume(market.volume)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

function EmbedPanel({ event, onClose }: { event: BayseEvent; onClose: () => void }) {
  const market = event.markets[0]
  const [copied, setCopied] = useState<"script" | "iframe" | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://crowdline.io"
  const embedUrl = `${baseUrl}/embed/${event.id}`

  const scriptCode = `<script
  src="${baseUrl}/widget.js"
  data-event="${event.id}"
  data-theme="${theme}"
></script>`

  const iframeCode = `<iframe
  src="${embedUrl}?theme=${theme}"
  width="380"
  height="160"
  frameborder="0"
  scrolling="no"
  style="border:none;border-radius:12px"
></iframe>`

  const copy = (type: "script" | "iframe") => {
    const text = type === "script" ? scriptCode : iframeCode
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="mb-6">
        <SheetTitle className="text-left font-mono text-xs text-[#1369F1] uppercase tracking-widest">
          Embed this market
        </SheetTitle>
        <p className="text-sm text-[#f0ede6] leading-snug font-medium mt-1">
          {event.title}
        </p>
      </SheetHeader>

      {/* Live preview */}
      <div className="mb-6">
        <p className="mb-3 font-mono text-[10px] text-[#777] uppercase tracking-widest">Preview</p>
        <InlineWidget event={event} market={market} theme={theme} />
      </div>

      {/* Theme toggle */}
      <div className="mb-6">
        <p className="mb-3 font-mono text-[10px] text-[#777] uppercase tracking-widest">Theme</p>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-lg border px-4 py-2 font-mono text-xs capitalize transition-all ${
                theme === t
                  ? "border-[#1369F1] bg-[#1369F1]/10 text-[#1369F1]"
                  : "border-[#333] bg-transparent text-[#A1A1A1] hover:border-[#555] hover:text-[#ccc]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Separator className="mb-6 bg-[#1a1a1a]" />

      {/* Script tag */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] text-[#777] uppercase tracking-widest">Script tag</p>
          <button
            onClick={() => copy("script")}
            className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${
              copied === "script" ? "text-[#22c55e]" : "text-[#888] hover:text-[#1369F1]"
            }`}
          >
            {copied === "script" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="rounded-lg border border-[#1e1e1e] bg-[#080808] p-3">
          <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-[#A1A1A1] whitespace-pre-wrap break-all">
            {scriptCode}
          </pre>
        </div>
      </div>

      {/* Iframe */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] text-[#777] uppercase tracking-widest">Iframe</p>
          <button
            onClick={() => copy("iframe")}
            className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${
              copied === "iframe" ? "text-[#22c55e]" : "text-[#888] hover:text-[#1369F1]"
            }`}
          >
            {copied === "iframe" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="rounded-lg border border-[#1e1e1e] bg-[#080808] p-3">
          <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-[#A1A1A1] whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
        </div>
      </div>

      {/* Open widget page */}
      <div className="mt-auto">
        <Link
          href={embedUrl}
          target="_blank"
          className="flex h-8 w-full items-center justify-center rounded-md border border-[#333] bg-transparent font-mono text-xs text-[#888] hover:border-[#555] hover:bg-[#111] hover:text-[#f0ede6] uppercase tracking-wider transition-colors"
        >
          Open widget page ↗
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [events, setEvents] = useState<BayseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [selected, setSelected] = useState<BayseEvent | null>(null)
  const isMobile = useIsMobile()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== "All") params.set("category", category)
      const res = await fetch(`/api/markets?${params}`)
      const json = await res.json()
      setEvents(json.data ?? [])
    } catch {
      setEvents(MOCK_EVENTS)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filtered = events.filter((e) =>
    search
      ? e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0ede6]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-widest text-[#f0ede6]">CROWDLINE</span>
            <span className="rounded border border-[#444] px-1.5 py-0.5 font-mono text-[9px] text-[#888] uppercase tracking-widest">Beta</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono text-[11px] text-[#888]">{events.length} markets</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-[#f0ede6]">Browse markets</h1>
          <p className="text-sm text-[#888]">Select any market to get the embed code.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 border-[#1e1e1e] bg-[#0d0d0d] text-sm text-[#f0ede6] placeholder-[#444] focus-visible:ring-[#1369F1]/30 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                  category === cat
                    ? "bg-[#1369F1] text-white font-semibold"
                    : "border border-[#333] bg-transparent text-[#888] hover:border-[#555] hover:text-[#ccc]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-5 space-y-3">
                <Skeleton className="h-3 w-16 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-full bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-3/4 bg-[#1a1a1a]" />
                <Skeleton className="h-1.5 w-full bg-[#1a1a1a]" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12 bg-[#1a1a1a]" />
                  <Skeleton className="h-4 w-24 bg-[#1a1a1a]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 font-mono text-4xl text-[#1e1e1e]">—</div>
            <p className="text-sm text-[#888]">No markets found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <MarketCard key={event.id} event={event} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Embed panel — bottom sheet on mobile, right panel on desktop */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "rounded-t-2xl border-t border-[#1a1a1a] bg-[#0d0d0d] p-6 max-h-[85vh] overflow-y-auto"
              : "w-full border-[#1a1a1a] bg-[#0d0d0d] p-6 sm:max-w-md overflow-y-auto"
          }
        >
          {selected && <EmbedPanel event={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}
