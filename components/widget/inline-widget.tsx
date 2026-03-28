"use client"

import { useState, useEffect } from "react"
import type { BayseEvent, BayseMarket } from "@/lib/bayse"

interface InlineWidgetProps {
  event: BayseEvent
  market: BayseMarket
  theme?: "dark" | "light"
  compact?: boolean
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n}`
}

function formatTraders(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function InlineWidget({ event, market, theme = "dark", compact = false }: InlineWidgetProps) {
  const [tick, setTick] = useState(0)
  const [isLive, setIsLive] = useState(true)

  // Simulate live updates with slight price fluctuation
  const [liveOutcomes, setLiveOutcomes] = useState(market.outcomes)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
      // Tiny random walk to simulate live data
      setLiveOutcomes((prev) => {
        const delta = (Math.random() - 0.5) * 0.004
        const yes = Math.max(0.05, Math.min(0.95, (prev[0]?.price ?? 0.5) + delta))
        return [
          { ...prev[0], price: yes },
          { ...prev[1], price: 1 - yes },
        ]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const yesOutcome = liveOutcomes[0]
  const noOutcome = liveOutcomes[1]
  const yesPct = Math.round((yesOutcome?.price ?? 0.5) * 100)
  const noPct = 100 - yesPct

  const isDark = theme === "dark"

  const daysLeft = event.endDate
    ? Math.max(0, Math.ceil((new Date(event.endDate).getTime() - Date.now()) / 86_400_000))
    : null

  return (
    <div
      className={`rounded-xl overflow-hidden font-sans ${
        isDark
          ? "bg-[#0d0d0d] border border-[#1e1e1e]"
          : "bg-white border border-[#e5e7eb]"
      } ${compact ? "p-3" : "p-4"}`}
      style={{ fontFamily: "var(--font-sans, DM Sans, sans-serif)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {event.category && (
              <span
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  isDark ? "text-[#1369F1]" : "text-[#d97706]"
                }`}
              >
                {event.category}
              </span>
            )}
          </div>
          <p
            className={`text-sm font-medium leading-snug ${
              isDark ? "text-[#f0ede6]" : "text-[#111]"
            } ${compact ? "line-clamp-1" : "line-clamp-2"}`}
          >
            {event.title}
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-[#22c55e] animate-pulse" : "bg-[#444]"}`}
          />
          <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-[#444]" : "text-[#999]"}`}>
            Live
          </span>
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className={`flex h-8 overflow-hidden rounded-lg ${isDark ? "bg-[#1a1a1a]" : "bg-[#f3f4f6]"}`}>
          {/* YES bar */}
          <div
            className="flex items-center justify-center transition-all duration-700 ease-out"
            style={{ width: `${yesPct}%`, backgroundColor: "#22c55e" }}
          >
            {yesPct > 20 && (
              <span className="font-mono text-xs font-semibold text-white tabular-nums">
                {yesPct}%
              </span>
            )}
          </div>
          {/* NO bar */}
          <div
            className="flex items-center justify-center transition-all duration-700 ease-out flex-1"
            style={{ backgroundColor: "#ef4444" }}
          >
            {noPct > 20 && (
              <span className="font-mono text-xs font-semibold text-white tabular-nums">
                {noPct}%
              </span>
            )}
          </div>
        </div>

        {/* Labels */}
        <div className={`mt-1.5 flex justify-between font-mono text-[11px] ${isDark ? "text-[#555]" : "text-[#999]"}`}>
          <span className="text-[#22c55e] font-medium">YES {yesPct}%</span>
          <span className="text-[#ef4444] font-medium">NO {noPct}%</span>
        </div>
      </div>

      {/* Stats row */}
      {!compact && (
        <div className={`flex items-center gap-4 pt-3 border-t ${isDark ? "border-[#1a1a1a]" : "border-[#f0f0f0]"}`}>
          <div>
            <div className={`font-mono text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? "text-[#444]" : "text-[#bbb]"}`}>
              Traders
            </div>
            <div className={`font-mono text-sm font-semibold ${isDark ? "text-[#f0ede6]" : "text-[#111]"}`}>
              {formatTraders(market.traderCount ?? 0)}
            </div>
          </div>

          {market.volume !== undefined && (
            <div>
              <div className={`font-mono text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? "text-[#444]" : "text-[#bbb]"}`}>
                Volume
              </div>
              <div className={`font-mono text-sm font-semibold ${isDark ? "text-[#f0ede6]" : "text-[#111]"}`}>
                {formatVolume(market.volume)}
              </div>
            </div>
          )}

          {daysLeft !== null && (
            <div className="ml-auto">
              <div className={`font-mono text-[10px] uppercase tracking-wider mb-0.5 text-right ${isDark ? "text-[#444]" : "text-[#bbb]"}`}>
                Closes in
              </div>
              <div className={`font-mono text-sm font-semibold text-right ${isDark ? "text-[#f0ede6]" : "text-[#111]"}`}>
                {daysLeft}d
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribution */}
      <div className={`mt-3 flex items-center justify-between ${compact ? "" : ""}`}>
        <a
          href="https://gowagr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[#A1A1A1] transition-colors hover:text-[#f0ede6]"
        >
          via GoWagr · Bayse Markets
        </a>
        <span className="font-mono text-[10px] text-[#A1A1A1]">
          Crowdline
        </span>
      </div>
    </div>
  )
}
