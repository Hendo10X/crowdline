import { NextRequest, NextResponse } from "next/server"
import { getEvent, MOCK_EVENTS } from "@/lib/bayse"

export const runtime = "edge"

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params

  try {
    const data = await getEvent(eventId)
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch {
    const mock = MOCK_EVENTS.find((e) => e.id === eventId)
    if (!mock) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(mock, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Data-Source": "mock",
      },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
