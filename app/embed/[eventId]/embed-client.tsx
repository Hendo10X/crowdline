"use client"

import { useState, useEffect, useCallback } from "react"
import type { BayseEvent, BayseMarket } from "@/lib/bayse"

interface EmbedClientProps {
  event: BayseEvent
  market: BayseMarket
  theme: "dark" | "light"
  compact?: boolean
}

function formatTraders(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n}`
}

export function EmbedWidgetClient({ event, market, theme, compact = false }: EmbedClientProps) {
  const isDark = theme === "dark"
  const [liveOutcomes, setLiveOutcomes] = useState(market.outcomes)
  const [traderCount, setTraderCount] = useState(market.traderCount ?? 0)
  const [lastUpdated, setLastUpdated] = useState(Date.now())

  // Poll for updates every 30 seconds
  const pollUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/api/markets/${event.id}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      const m = data.markets?.[0]
      if (m?.outcomes) {
        setLiveOutcomes(m.outcomes)
        setTraderCount(m.traderCount ?? traderCount)
        setLastUpdated(Date.now())
      }
    } catch {
      // keep current data
    }
  }, [event.id, traderCount])

  // Simulate gentle live fluctuation for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOutcomes((prev) => {
        const delta = (Math.random() - 0.5) * 0.005
        const yes = Math.max(0.05, Math.min(0.95, (prev[0]?.price ?? 0.5) + delta))
        return [
          { ...prev[0], price: yes },
          { ...prev[1], price: 1 - yes },
        ]
      })
    }, 5000)

    const pollInterval = setInterval(pollUpdate, 30_000)
    return () => {
      clearInterval(interval)
      clearInterval(pollInterval)
    }
  }, [pollUpdate])

  const yesOutcome = liveOutcomes[0]
  const noOutcome = liveOutcomes[1]
  const yesPct = Math.round((yesOutcome?.price ?? 0.5) * 100)
  const noPct = 100 - yesPct
  const daysLeft = event.endDate
    ? Math.max(0, Math.ceil((new Date(event.endDate).getTime() - Date.now()) / 86_400_000))
    : null

  const bg = isDark ? "#0d0d0d" : "#ffffff"
  const border = isDark ? "1px solid #1e1e1e" : "1px solid #e5e7eb"
  const textPrimary = isDark ? "#f0ede6" : "#111111"
  const textMuted = isDark ? "#555555" : "#9ca3af"
  const textLabel = isDark ? "#3a3a3a" : "#d1d5db"
  const barBg = isDark ? "#1a1a1a" : "#f3f4f6"
  const divider = isDark ? "#1a1a1a" : "#f0f0f0"
  const blue = "#1369F1"

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: "12px",
        padding: compact ? "12px" : "16px",
        fontFamily: "'DM Sans', sans-serif",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {event.category && (
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: blue,
                marginBottom: "4px",
              }}
            >
              {event.category}
            </div>
          )}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: textPrimary,
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: compact ? 1 : 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {event.title}
          </div>
        </div>

        {/* Live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginTop: "2px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              animation: "livePulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: textMuted,
            }}
          >
            Live
          </span>
        </div>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            height: "32px",
            borderRadius: "8px",
            overflow: "hidden",
            background: barBg,
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${yesPct}%`,
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {yesPct > 20 && (
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {yesPct}%
              </span>
            )}
          </div>
          <div
            style={{
              flex: 1,
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {noPct > 20 && (
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {noPct}%
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "6px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
          }}
        >
          <span style={{ color: "#22c55e", fontWeight: 500 }}>YES {yesPct}%</span>
          <span style={{ color: "#ef4444", fontWeight: 500 }}>NO {noPct}%</span>
        </div>
      </div>

      {/* Stats row */}
      {!compact && (
        <>
          <div
            style={{
              borderTop: `1px solid ${divider}`,
              paddingTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: textLabel,
                  marginBottom: "2px",
                }}
              >
                Traders
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: textPrimary,
                }}
              >
                {formatTraders(traderCount)}
              </div>
            </div>

            {market.volume !== undefined && (
              <div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: textLabel,
                    marginBottom: "2px",
                  }}
                >
                  Volume
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  {formatVolume(market.volume)}
                </div>
              </div>
            )}

            {daysLeft !== null && (
              <div style={{ marginLeft: "auto" }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: textLabel,
                    marginBottom: "2px",
                    textAlign: "right",
                  }}
                >
                  Closes
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: textPrimary,
                    textAlign: "right",
                  }}
                >
                  {daysLeft}d
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attribution */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="https://gowagr.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: textLabel,
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          via GoWagr · Bayse Markets
        </a>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: textLabel,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Crowdline
        </span>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
