import { NextRequest, NextResponse } from "next/server"
import { getEvents, MOCK_EVENTS } from "@/lib/bayse"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? 1)
  const status = searchParams.get("status") ?? undefined
  const category = searchParams.get("category") ?? undefined

  try {
    const data = await getEvents({ page, status, category })
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch {
    // Fallback to mock data when API key is not configured
    const filtered = MOCK_EVENTS.filter((e) => {
      if (status && e.status !== status) return false
      if (category && e.category?.toLowerCase() !== category.toLowerCase()) return false
      return true
    })

    return NextResponse.json(
      {
        data: filtered,
        pagination: {
          page: 1,
          size: filtered.length,
          lastPage: 1,
          totalCount: filtered.length,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-Data-Source": "mock",
        },
      },
    )
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
