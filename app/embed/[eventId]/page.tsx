import { Suspense } from "react"
import type { Metadata } from "next"
import { MOCK_EVENTS, getEvent } from "@/lib/bayse"
import { EmbedWidgetClient } from "./embed-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>
}): Promise<Metadata> {
  const { eventId } = await params
  const event = MOCK_EVENTS.find((e) => e.id === eventId)
  return {
    title: event?.title ?? "Crowdline Widget",
    description: "Live prediction market data powered by Crowdline and Bayse Markets.",
  }
}

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ theme?: string; compact?: string }>
}) {
  const { eventId } = await params
  const { theme, compact } = await searchParams

  // Try to fetch live data; fall back to mock
  let event = MOCK_EVENTS.find((e) => e.id === eventId) ?? MOCK_EVENTS[0]
  try {
    event = await getEvent(eventId)
  } catch {
    // use mock fallback
  }

  const market = event.markets[0]
  const isDark = theme !== "light"
  const isCompact = compact === "true"

  return (
    <html lang="en" style={{ colorScheme: isDark ? "dark" : "light" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; overflow: hidden; }
          body {
            font-family: 'DM Sans', sans-serif;
            background: transparent;
          }
        `}</style>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Suspense>
          <EmbedWidgetClient
            event={event}
            market={market}
            theme={isDark ? "dark" : "light"}
            compact={isCompact}
          />
        </Suspense>
      </body>
    </html>
  )
}
