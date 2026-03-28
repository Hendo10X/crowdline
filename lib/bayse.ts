/**
 * Bayse Markets API Client
 * Base URL: https://relay.bayse.markets
 *
 * Auth levels:
 *   Public  — no headers needed
 *   Read    — X-Public-Key
 *   Write   — X-Public-Key + X-Timestamp + X-Signature (HMAC-SHA256)
 */

const BAYSE_BASE = process.env.BAYSE_BASE_URL ?? "https://relay.bayse.markets"
const BAYSE_PUBLIC_KEY = process.env.BAYSE_PUBLIC_KEY ?? ""

// ─── Internal normalised types (used by components) ───────────────────────────

export interface BayseEvent {
  id: string
  title: string
  description?: string
  status: "open" | "closed" | "resolved"
  category?: string
  imageUrl?: string
  endDate?: string
  createdAt: string
  markets: BayseMarket[]
}

export interface BayseMarket {
  id: string
  eventId: string
  title: string
  outcomes: BayseOutcome[]
  volume?: number
  liquidity?: number
  traderCount?: number
}

export interface BayseOutcome {
  id: string
  title: string
  price: number   // 0–1 representing probability
  change?: number // 24h change
}

export interface BayseEventsResponse {
  data: BayseEvent[]
  pagination: {
    page: number
    size: number
    lastPage: number
    totalCount: number
  }
}

// ─── Raw API types (what Bayse actually returns) ───────────────────────────────

interface RawMarket {
  id: string
  title: string
  status: string
  outcome1Id: string
  outcome1Label: string
  outcome1Price: number
  outcome2Id: string
  outcome2Label: string
  outcome2Price: number
  totalOrders: number
  yesBuyPrice: number
  noBuyPrice: number
  feePercentage: number
}

interface RawEvent {
  id: string
  title: string
  description: string
  category: string
  status: string
  imageUrl: string
  image128Url: string
  resolutionDate: string
  createdAt: string
  liquidity: number
  totalVolume: number
  totalOrders: number
  markets: RawMarket[]
}

interface RawEventsResponse {
  events: RawEvent[]
  pagination: {
    page: number
    size: number
    lastPage: number
    totalCount: number
  }
}

// ─── Normalisation ─────────────────────────────────────────────────────────────

function normaliseMarket(raw: RawMarket, eventId: string, eventVolume: number, eventLiquidity: number): BayseMarket {
  return {
    id: raw.id,
    eventId,
    title: raw.title,
    traderCount: raw.totalOrders,
    volume: eventVolume,
    liquidity: eventLiquidity,
    outcomes: [
      { id: raw.outcome1Id, title: raw.outcome1Label, price: raw.outcome1Price },
      { id: raw.outcome2Id, title: raw.outcome2Label, price: raw.outcome2Price },
    ],
  }
}

function normaliseEvent(raw: RawEvent): BayseEvent {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: raw.status as BayseEvent["status"],
    category: raw.category,
    imageUrl: raw.imageUrl ?? raw.image128Url,
    endDate: raw.resolutionDate || undefined,
    createdAt: raw.createdAt,
    markets: (raw.markets ?? []).map((m) => normaliseMarket(m, raw.id, raw.totalVolume, raw.liquidity)),
  }
}

// ─── API client ────────────────────────────────────────────────────────────────

function readHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  if (BAYSE_PUBLIC_KEY) {
    headers["X-Public-Key"] = BAYSE_PUBLIC_KEY
  }
  return headers
}

async function bayseGet<T>(path: string): Promise<T> {
  const url = `${BAYSE_BASE}${path}`
  const res = await fetch(url, {
    headers: readHeaders(),
    next: { revalidate: 30 },
  })

  if (!res.ok) {
    throw new Error(`Bayse API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export async function getEvents(params?: {
  page?: number
  status?: string
  category?: string
}): Promise<BayseEventsResponse> {
  const query = new URLSearchParams()
  if (params?.page && params.page > 1) query.set("page", String(params.page))
  if (params?.status) query.set("status", params.status)
  if (params?.category) query.set("category", params.category)

  const qs = query.toString() ? `?${query.toString()}` : ""
  const raw = await bayseGet<RawEventsResponse>(`/v1/pm/events${qs}`)

  return {
    data: raw.events.map(normaliseEvent),
    pagination: raw.pagination,
  }
}

export async function getEvent(eventId: string): Promise<BayseEvent> {
  const raw = await bayseGet<RawEvent>(`/v1/pm/events/${eventId}`)
  return normaliseEvent(raw)
}

// ─── Mock data (fallback when no API key set) ──────────────────────────────────

export const MOCK_EVENTS: BayseEvent[] = [
  {
    id: "evt_afcon_ng_2027",
    title: "Nigeria wins AFCON 2027",
    description: "Will the Super Eagles claim the Africa Cup of Nations title in 2027?",
    status: "open",
    category: "Sports",
    endDate: "2027-02-15T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    markets: [
      {
        id: "mkt_afcon_ng_yes",
        eventId: "evt_afcon_ng_2027",
        title: "Nigeria wins AFCON 2027",
        traderCount: 2341,
        volume: 18500000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.54, change: 0.03 },
          { id: "out_no", title: "No", price: 0.46, change: -0.03 },
        ],
      },
    ],
  },
  {
    id: "evt_obi_poll_dec",
    title: "Peter Obi polls above 40% by December 2026",
    description: "Will Peter Obi's approval rating exceed 40% in any major poll before Dec 31, 2026?",
    status: "open",
    category: "Politics",
    endDate: "2026-12-31T00:00:00Z",
    createdAt: "2026-01-15T00:00:00Z",
    markets: [
      {
        id: "mkt_obi_poll",
        eventId: "evt_obi_poll_dec",
        title: "Peter Obi polls above 40%",
        traderCount: 1876,
        volume: 12300000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.31, change: -0.05 },
          { id: "out_no", title: "No", price: 0.69, change: 0.05 },
        ],
      },
    ],
  },
  {
    id: "evt_tinubu_reelect",
    title: "Tinubu re-elected in 2027",
    description: "Will President Bola Tinubu win the 2027 Nigerian presidential election?",
    status: "open",
    category: "Politics",
    endDate: "2027-03-01T00:00:00Z",
    createdAt: "2026-01-10T00:00:00Z",
    markets: [
      {
        id: "mkt_tinubu_27",
        eventId: "evt_tinubu_reelect",
        title: "Tinubu re-elected in 2027",
        traderCount: 4210,
        volume: 54000000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.54, change: -0.02 },
          { id: "out_no", title: "No", price: 0.46, change: 0.02 },
        ],
      },
    ],
  },
  {
    id: "evt_naira_usd_q4",
    title: "Naira stabilises below ₦1,400/$ by Q4 2026",
    description: "Will USD/NGN fall below 1,400 and stay there for at least 30 days before Dec 2026?",
    status: "open",
    category: "Economy",
    endDate: "2026-12-01T00:00:00Z",
    createdAt: "2026-02-01T00:00:00Z",
    markets: [
      {
        id: "mkt_naira_stable",
        eventId: "evt_naira_usd_q4",
        title: "Naira below ₦1,400/$",
        traderCount: 983,
        volume: 6200000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.22, change: -0.08 },
          { id: "out_no", title: "No", price: 0.78, change: 0.08 },
        ],
      },
    ],
  },
  {
    id: "evt_dangote_refinery",
    title: "Dangote Refinery at 50% capacity by June 2026",
    description: "Will the Dangote refinery reach 50% of its rated production capacity before June 30, 2026?",
    status: "open",
    category: "Business",
    endDate: "2026-06-30T00:00:00Z",
    createdAt: "2026-01-20T00:00:00Z",
    markets: [
      {
        id: "mkt_dangote_cap",
        eventId: "evt_dangote_refinery",
        title: "Dangote at 50% capacity",
        traderCount: 1542,
        volume: 9800000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.41, change: 0.06 },
          { id: "out_no", title: "No", price: 0.59, change: -0.06 },
        ],
      },
    ],
  },
  {
    id: "evt_lagos_metro",
    title: "Lagos Blue Line reaches 12 stations by end of 2026",
    description: "Will the Lagos Blue Line rail system expand to at least 12 operational stations before Jan 2027?",
    status: "open",
    category: "Infrastructure",
    endDate: "2026-12-31T00:00:00Z",
    createdAt: "2026-01-25T00:00:00Z",
    markets: [
      {
        id: "mkt_lagos_rail",
        eventId: "evt_lagos_metro",
        title: "Lagos Blue Line 12 stations",
        traderCount: 672,
        volume: 3400000,
        outcomes: [
          { id: "out_yes", title: "Yes", price: 0.67, change: 0.04 },
          { id: "out_no", title: "No", price: 0.33, change: -0.04 },
        ],
      },
    ],
  },
]
