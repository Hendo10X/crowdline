"use client"

import { useEffect, useRef } from "react"
import createGlobe, { type Globe as GlobeInstance } from "cobe"

const THETA = 0.25

const CITY_MARKERS: {
  location: [number, number]
  label: string
  flag: string
  value: string
}[] = [
  // Nigeria
  { location: [6.5244, 3.3792],    label: "Lagos",          flag: "🇳🇬", value: "54%" },
  { location: [9.0765, 7.3986],    label: "Abuja",          flag: "🇳🇬", value: "61%" },
  { location: [4.8156, 7.0498],    label: "Port Harcourt",  flag: "🇳🇬", value: "47%" },
  // West Africa
  { location: [5.6037, -0.187],    label: "Accra",          flag: "🇬🇭", value: "38%" },
  { location: [14.6928, -17.4467], label: "Dakar",          flag: "🇸🇳", value: "52%" },
  { location: [6.3654, 2.4183],    label: "Cotonou",        flag: "🇧🇯", value: "29%" },
  // East Africa
  { location: [-1.2921, 36.8219],  label: "Nairobi",        flag: "🇰🇪", value: "72%" },
  { location: [-6.1630, 35.7516],  label: "Dodoma",         flag: "🇹🇿", value: "41%" },
  { location: [0.3476, 32.5825],   label: "Kampala",        flag: "🇺🇬", value: "63%" },
  { location: [-1.9441, 30.0619],  label: "Kigali",         flag: "🇷🇼", value: "57%" },
  { location: [9.025, 38.747],     label: "Addis Ababa",    flag: "🇪🇹", value: "45%" },
  // Southern Africa
  { location: [-26.2041, 28.0473], label: "Johannesburg",   flag: "🇿🇦", value: "43%" },
  // North Africa / Middle East
  { location: [30.0444, 31.2357],  label: "Cairo",          flag: "🇪🇬", value: "58%" },
  { location: [25.2048, 55.2708],  label: "Dubai",          flag: "🇦🇪", value: "66%" },
  // Europe
  { location: [51.5074, -0.1278],  label: "London",         flag: "🇬🇧", value: "49%" },
  { location: [48.8566, 2.3522],   label: "Paris",          flag: "🇫🇷", value: "44%" },
  { location: [52.52, 13.405],     label: "Berlin",         flag: "🇩🇪", value: "37%" },
  // Americas
  { location: [40.7128, -74.006],  label: "New York",       flag: "🇺🇸", value: "67%" },
  { location: [-23.5505, -46.633], label: "São Paulo",      flag: "🇧🇷", value: "55%" },
  // Asia
  { location: [1.3521, 103.8198],  label: "Singapore",      flag: "🇸🇬", value: "71%" },
  { location: [19.076, 72.8777],   label: "Mumbai",         flag: "🇮🇳", value: "48%" },
]

/** Project geographic [lat, lng] to normalised screen coords [0..1] */
function project(lat: number, lng: number, phi: number) {
  const latR = (lat * Math.PI) / 180
  const lngR = (lng * Math.PI) / 180

  const cosLat = Math.cos(latR)
  const x = cosLat * Math.sin(lngR)
  const y = Math.sin(latR)
  const z = cosLat * Math.cos(lngR)

  // Y-axis rotation
  const x1 =  x * Math.cos(phi) + z * Math.sin(phi)
  const y1 = y
  const z1 = -x * Math.sin(phi) + z * Math.cos(phi)

  // X-axis tilt (theta)
  const x2 = x1
  const y2 = y1 * Math.cos(THETA) - z1 * Math.sin(THETA)
  const z2 = y1 * Math.sin(THETA) + z1 * Math.cos(THETA)

  return { sx: x2 * 0.5 + 0.5, sy: -y2 * 0.5 + 0.5, visible: z2 > 0.14 }
}

export function Globe({ className }: { className?: string }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const globeRef   = useRef<GlobeInstance | null>(null)
  const rafRef     = useRef<number>(0)
  const phiRef     = useRef(1.2)
  const dragging   = useRef(false)
  const lastX      = useRef(0)
  const dragDelta  = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const size   = canvas.offsetWidth

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width:  size * 2,
      height: size * 2,
      phi:    phiRef.current,
      theta:  THETA,
      dark:   1,
      diffuse: 0.85,
      mapSamples:    20000,
      mapBrightness: 1.8,
      baseColor:   [0.08, 0.08, 0.08],
      markerColor: [0.075, 0.412, 0.945],
      glowColor:   [0.075, 0.412, 0.945],
      scale:   1,
      offset:  [0, 0],
      // No markers — we use HTML overlays only
    })

    const animate = () => {
      if (!dragging.current) phiRef.current += 0.003
      const phi = phiRef.current + dragDelta.current
      globeRef.current?.update({ phi })

      if (overlayRef.current) {
        const labels = overlayRef.current.querySelectorAll<HTMLElement>("[data-city]")
        labels.forEach((el, i) => {
          const m = CITY_MARKERS[i]
          if (!m) return
          const { sx, sy, visible } = project(m.location[0], m.location[1], phi)
          el.style.left    = `${sx * 100}%`
          el.style.top     = `${sy * 100}%`
          el.style.opacity = visible ? "1" : "0"
        })
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    const onResize = () => {
      if (!canvasRef.current || !globeRef.current) return
      const s = canvasRef.current.offsetWidth
      globeRef.current.update({ width: s * 2, height: s * 2 })
    }
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div className={className} style={{ position: "relative", aspectRatio: "1" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          dragging.current = true
          lastX.current = e.clientX
          canvasRef.current!.style.cursor = "grabbing"
        }}
        onPointerUp={() => {
          dragging.current = false
          phiRef.current += dragDelta.current
          dragDelta.current = 0
          canvasRef.current!.style.cursor = "grab"
        }}
        onPointerLeave={() => {
          dragging.current = false
          phiRef.current += dragDelta.current
          dragDelta.current = 0
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          dragDelta.current = (e.clientX - lastX.current) * 0.005
        }}
        style={{ width: "100%", height: "100%", cursor: "grab", contain: "layout paint size" }}
      />

      {/* City badge overlay — no dots, just pills */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0">
        {CITY_MARKERS.map((m, i) => (
          <div
            key={i}
            data-city={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: 0, willChange: "left, top, opacity" }}
          >
            <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-[#0e0e0e]/85 px-2 py-0.5 backdrop-blur-sm">
              <span className="text-[10px] leading-none">{m.flag}</span>
              <span className="font-mono text-[9px] leading-none text-[#aaa]">{m.label}</span>
              <span className="font-mono text-[9px] leading-none font-bold text-[#1369F1]">{m.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
