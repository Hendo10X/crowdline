"use client"

import { useEffect, useRef } from "react"
import createGlobe, { type Globe as GlobeInstance } from "cobe"

const THETA = 0.25

const CITY_MARKERS: {
  location: [number, number]
  size: number
  label: string
  flag: string
  value: string
}[] = [
  { location: [6.5244, 3.3792],    size: 0.07, label: "Lagos",         flag: "🇳🇬", value: "54%" },
  { location: [9.0765, 7.3986],    size: 0.05, label: "Abuja",         flag: "🇳🇬", value: "61%" },
  { location: [5.6037, -0.187],    size: 0.04, label: "Accra",         flag: "🇬🇭", value: "38%" },
  { location: [-1.2921, 36.8219],  size: 0.04, label: "Nairobi",       flag: "🇰🇪", value: "72%" },
  { location: [51.5074, -0.1278],  size: 0.04, label: "London",        flag: "🇬🇧", value: "49%" },
  { location: [40.7128, -74.006],  size: 0.04, label: "New York",      flag: "🇺🇸", value: "67%" },
  { location: [-26.2041, 28.0473], size: 0.04, label: "Johannesburg",  flag: "🇿🇦", value: "43%" },
  { location: [30.0444, 31.2357],  size: 0.04, label: "Cairo",         flag: "🇪🇬", value: "58%" },
]

/** Project geographic [lat, lng] onto globe screen space [0..1] */
function project(lat: number, lng: number, phi: number) {
  const latR = (lat * Math.PI) / 180
  const lngR = (lng * Math.PI) / 180

  // Cartesian on unit sphere (z is "into screen" at lng=0, phi=0)
  const cosLat = Math.cos(latR)
  const x = cosLat * Math.sin(lngR) // horizontal
  const y = Math.sin(latR)           // vertical
  const z = cosLat * Math.cos(lngR) // depth

  // Y-axis rotation by phi
  const x1 = x * Math.cos(phi) + z * Math.sin(phi)
  const y1 = y
  const z1 = -x * Math.sin(phi) + z * Math.cos(phi)

  // X-axis tilt by theta
  const x2 = x1
  const y2 = y1 * Math.cos(THETA) - z1 * Math.sin(THETA)
  const z2 = y1 * Math.sin(THETA) + z1 * Math.cos(THETA)

  return {
    sx: x2 * 0.5 + 0.5,
    sy: -y2 * 0.5 + 0.5,
    visible: z2 > 0.12, // only front hemisphere
  }
}

export function Globe({ className }: { className?: string }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const globeRef    = useRef<GlobeInstance | null>(null)
  const rafRef      = useRef<number>(0)
  const phiRef      = useRef(1.2) // start centred on West Africa
  const isDragging  = useRef(false)
  const lastX       = useRef(0)
  const dragDelta   = useRef(0)

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
      diffuse: 0.9,
      mapSamples:    20000,
      mapBrightness: 1.8,
      baseColor:   [0.08, 0.08, 0.08],
      markerColor: [0.075, 0.412, 0.945],
      glowColor:   [0.075, 0.412, 0.945],
      scale:  1,
      offset: [0, 0],
      markers: CITY_MARKERS,
    })

    const animate = () => {
      if (!isDragging.current) phiRef.current += 0.003
      const currentPhi = phiRef.current + dragDelta.current
      globeRef.current?.update({ phi: currentPhi })

      // Update each city badge position directly in the DOM
      if (overlayRef.current && canvasRef.current) {
        const labels = overlayRef.current.querySelectorAll<HTMLElement>("[data-city]")
        labels.forEach((el, i) => {
          const m = CITY_MARKERS[i]
          if (!m) return
          const { sx, sy, visible } = project(m.location[0], m.location[1], currentPhi)
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
      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          isDragging.current = true
          lastX.current = e.clientX
          canvasRef.current!.style.cursor = "grabbing"
        }}
        onPointerUp={() => {
          isDragging.current = false
          phiRef.current += dragDelta.current
          dragDelta.current = 0
          canvasRef.current!.style.cursor = "grab"
        }}
        onPointerLeave={() => {
          isDragging.current = false
          phiRef.current += dragDelta.current
          dragDelta.current = 0
        }}
        onPointerMove={(e) => {
          if (!isDragging.current) return
          dragDelta.current = (e.clientX - lastX.current) * 0.005
        }}
        style={{ width: "100%", height: "100%", cursor: "grab", contain: "layout paint size" }}
      />

      {/* City badge overlay */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0">
        {CITY_MARKERS.map((m, i) => (
          <div
            key={i}
            data-city={i}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ opacity: 0, willChange: "left, top, opacity" }}
          >
            {/* Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#1369F1]/25 bg-[#0e0e0e]/90 px-2.5 py-1 shadow-lg shadow-black/40 backdrop-blur-md">
              <span className="text-[11px] leading-none">{m.flag}</span>
              <span className="font-mono text-[10px] leading-none text-[#bbb]">{m.label}</span>
              <span className="font-mono text-[10px] leading-none font-semibold text-[#1369F1]">{m.value}</span>
            </div>
            {/* Stem line + dot */}
            <div className="mx-auto mt-0.5 flex flex-col items-center">
              <div className="h-2 w-px bg-[#1369F1]/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#1369F1] shadow-[0_0_6px_#1369F1]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
