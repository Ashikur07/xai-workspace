'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

// High-quality SVGs for the technology logos
export const NEXT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <circle cx="50" cy="50" r="48" fill="#000000" stroke="#ffffff" stroke-width="4"/>
  <path d="M78 81 L38 33 H30 V68 H37 V43 L72 85 C74 83.5 76 82.5 78 81 Z" fill="#ffffff"/>
  <rect x="63" y="33" width="7" height="35" fill="#ffffff"/>
</svg>
`

export const TAILWIND_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M50 20c-13.3 0-21.7 6.7-25 20 5-6.7 10.8-9.2 17.5-7.5 3.8.9 6.5 3.7 9.5 6.8 4.9 5 10.9 10.7 22.9 10.7 13.3 0 21.7-6.7 25-20-5 6.7-10.8 9.2-17.5 7.5-3.8-.9-6.5-3.7-9.5-6.8-5-5-11-10.7-22.9-10.7zm-25 30c-13.3 0-21.7 6.7-25 20 5-6.7 10.8-9.2 17.5-7.5 3.8.9 6.5 3.7 9.5 6.8 4.9 5 10.9 10.7 22.9 10.7 13.3 0 21.7-6.7 25-20-5 6.7-10.8 9.2-17.5 7.5-3.8-.9-6.5-3.7-9.5-6.8-5-5-11-10.7-22.9-10.7z" fill="#38BDF8"/>
</svg>
`

export const REACT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24" width="512" height="512">
  <circle cx="0" cy="0" r="2" fill="#61DAFB"/>
  <g stroke="#61DAFB" stroke-width="1.2" fill="none">
    <ellipse rx="11" ry="4.2"/>
    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
  </g>
</svg>
`

export const TYPESCRIPT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#3178C6" rx="15"/>
  <text x="85" y="80" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="bold" font-size="40" text-anchor="end">TS</text>
</svg>
`

export const JAVASCRIPT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#F7DF1E" rx="15"/>
  <text x="85" y="80" fill="#000000" font-family="system-ui, sans-serif" font-weight="bold" font-size="40" text-anchor="end">JS</text>
</svg>
`

const THREE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M50 10 L90 80 L10 80 Z" fill="#000000" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 10 L50 80" stroke="#ffffff" stroke-width="2"/>
  <path d="M10 80 L50 45 L90 80" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
</svg>
`

const FRAMER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M20 20 H80 L50 50 Z" fill="#FF00C7"/>
  <path d="M50 50 L80 80 H20 Z" fill="#7000FF"/>
  <path d="M20 50 L50 80 V20 Z" fill="#00F0FF" opacity="0.8"/>
</svg>
`

export const NODE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" fill="#339933" stroke="#ffffff" stroke-width="2"/>
  <path d="M50 10 L85 30 V70 L50 90 Z" fill="#66cc33" opacity="0.3"/>
  <path d="M50 25 C45 35 40 45 40 55 C40 65 48 70 50 72 C52 70 60 65 60 55 C60 45 55 35 50 25 Z" fill="#ffffff"/>
</svg>
`

const GIT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#F05032" rx="15"/>
  <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="#ffffff" stroke-width="4"/>
  <circle cx="50" cy="35" r="6" fill="#ffffff"/>
  <circle cx="50" cy="65" r="6" fill="#ffffff"/>
  <circle cx="65" cy="50" r="6" fill="#ffffff"/>
  <path d="M50 35 L50 65" stroke="#ffffff" stroke-width="4"/>
  <path d="M50 50 L65 50" stroke="#ffffff" stroke-width="4"/>
</svg>
`

const HTML_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M15 10 L85 10 L78 80 L50 90 L22 80 Z" fill="#E34F26"/>
  <path d="M50 10 L85 10 L78 80 L50 90 Z" fill="#EF652A"/>
  <path d="M50 30 H32 L34 50 H50 V38 H44 L43.5 44 H50 V50 H34 L36 70 L50 75 V63 L45 61 L44.5 56 H50 Z" fill="#ffffff"/>
  <path d="M50 30 H68 L66 50 H50 V38 H62 L61.5 44 H50 V50 H66 L64 70 L50 75 V63 L55 61 L55.5 56 H50 Z" fill="#E2E8F0" opacity="0.9"/>
</svg>
`

const CSS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <path d="M15 10 L85 10 L78 80 L50 90 L22 80 Z" fill="#1572B6"/>
  <path d="M50 10 L85 10 L78 80 L50 90 Z" fill="#33A9DC"/>
  <path d="M50 30 H32 L34 50 H50 V38 H44 L43.5 44 H50 V50 H34 L36 70 L50 75 V63 L45 61 L44.5 56 H50 Z" fill="#ffffff"/>
  <path d="M50 30 H68 L66 50 H50 V38 H62 L61.5 44 H50 V50 H66 L64 70 L50 75 V63 L55 61 L55.5 56 H50 Z" fill="#E2E8F0" opacity="0.9"/>
</svg>
`

interface IconConfig {
  name: string
  svg: string
  initialPos: [number, number, number]
  speed: number
  rotationSpeed: [number, number, number]
  scale: number
}

const ICONS_DATA: IconConfig[] = [
  { name: 'Next.js', svg: NEXT_SVG, initialPos: [-7.5, 3.2, -3.0], speed: 0.6, rotationSpeed: [0.003, 0.005, 0.002], scale: 1.1 },
  { name: 'Tailwind CSS', svg: TAILWIND_SVG, initialPos: [6.5, 2.8, -1.5], speed: 0.5, rotationSpeed: [0.004, 0.003, 0.005], scale: 1.05 },
  { name: 'React', svg: REACT_SVG, initialPos: [-4.5, -3.2, 0.5], speed: 0.7, rotationSpeed: [0.005, 0.004, 0.003], scale: 1.1 },
  { name: 'TypeScript', svg: TYPESCRIPT_SVG, initialPos: [7.2, -2.8, 1.0], speed: 0.4, rotationSpeed: [0.002, 0.005, 0.003], scale: 1.0 },
  { name: 'Three.js', svg: THREE_SVG, initialPos: [-8.2, -0.6, -1.0], speed: 0.55, rotationSpeed: [0.003, 0.003, 0.004], scale: 1.05 },
  { name: 'Framer Motion', svg: FRAMER_SVG, initialPos: [7.8, 0.5, -2.0], speed: 0.65, rotationSpeed: [0.006, 0.002, 0.005], scale: 1.0 },
  { name: 'Node.js', svg: NODE_SVG, initialPos: [-3.5, 3.8, 0.0], speed: 0.45, rotationSpeed: [0.002, 0.004, 0.002], scale: 1.05 },
  { name: 'JavaScript', svg: JAVASCRIPT_SVG, initialPos: [3.2, 4.0, -3.5], speed: 0.5, rotationSpeed: [0.003, 0.003, 0.003], scale: 1.0 },
  { name: 'Git', svg: GIT_SVG, initialPos: [-1.8, -4.2, -0.5], speed: 0.4, rotationSpeed: [0.004, 0.002, 0.002], scale: 0.95 },
  { name: 'CSS3', svg: CSS_SVG, initialPos: [4.8, -3.8, 1.5], speed: 0.45, rotationSpeed: [0.002, 0.003, 0.004], scale: 0.95 },
  { name: 'HTML5', svg: HTML_SVG, initialPos: [-0.5, 4.5, -4.0], speed: 0.35, rotationSpeed: [0.001, 0.002, 0.001], scale: 0.9 },
]

function FloatingCard({
  texture,
  config,
  mouse,
}: {
  texture?: THREE.Texture
  config: IconConfig
  mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Track continuous position in a Ref
  const currentPos = useRef(new THREE.Vector3(...config.initialPos))
  
  // Generate a random constant velocity vector for each card
  const velocity = useMemo(() => {
    // Random angle for 2D direction (XY)
    const angle = Math.random() * Math.PI * 2
    // Drifting speed (units per second)
    const speed = 0.25 + Math.random() * 0.4 
    return new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      (Math.random() - 0.5) * speed * 0.4 // gentle Z depth movement
    )
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    // Clamp delta to avoid massive teleportation on lag frames
    const dt = Math.min(delta, 0.1)

    // 1. Move logo based on its velocity
    currentPos.current.x += velocity.x * dt
    currentPos.current.y += velocity.y * dt
    currentPos.current.z += velocity.z * dt

    // 2. Wrap boundaries (based on viewport size at Z depth)
    const xBound = 9.0
    const yBound = 5.0
    const zBoundNear = 2.0
    const zBoundFar = -5.0

    if (currentPos.current.x > xBound) currentPos.current.x = -xBound
    else if (currentPos.current.x < -xBound) currentPos.current.x = xBound

    if (currentPos.current.y > yBound) currentPos.current.y = -yBound
    else if (currentPos.current.y < -yBound) currentPos.current.y = yBound

    if (currentPos.current.z > zBoundNear) currentPos.current.z = zBoundFar
    else if (currentPos.current.z < -5.0) currentPos.current.z = zBoundNear

    // 3. Continuous 3D rotation
    groupRef.current.rotation.x += config.rotationSpeed[0]
    groupRef.current.rotation.y += config.rotationSpeed[1]
    groupRef.current.rotation.z += config.rotationSpeed[2]

    // 4. Mouse Parallax (temporary rendering shift, doesn't affect drift path)
    const depthFactor = (currentPos.current.z + 5) / 7
    const mouseShiftX = mouse.current.x * 0.5 * depthFactor
    const mouseShiftY = mouse.current.y * 0.4 * depthFactor

    groupRef.current.position.x = currentPos.current.x + mouseShiftX
    groupRef.current.position.y = currentPos.current.y + mouseShiftY
    groupRef.current.position.z = currentPos.current.z
  })

  return (
    <group ref={groupRef}>
      {/* Glowing Double-Sided Tech Logo Plane (Smaller & Sleeker) */}
      <mesh>
        <planeGeometry args={[0.55 * config.scale, 0.55 * config.scale]} />
        {texture && (
          <meshStandardMaterial
            map={texture}
            transparent
            depthWrite={true}
            side={THREE.DoubleSide}
            emissive="#ffffff"
            emissiveMap={texture}
            emissiveIntensity={3.2} // Brighter glow
            roughness={0.2}
            metalness={0.1}
          />
        )}
      </mesh>
    </group>
  )
}

export default function FloatingIcons() {
  const [textures, setTextures] = useState<Record<string, THREE.Texture>>({})
  const mouse = useMousePosition()

  useEffect(() => {
    console.log("FloatingIcons: Starting texture loading...")
    const loader = new THREE.TextureLoader()
    const loadedTextures: Record<string, THREE.Texture> = {}
    const objectUrls: string[] = []
    let loadedCount = 0

    ICONS_DATA.forEach((icon) => {
      const blob = new Blob([icon.svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      objectUrls.push(url)

      loader.load(
        url,
        (texture) => {
          console.log(`FloatingIcons: Successfully loaded ${icon.name}`)
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.generateMipmaps = true
          
          loadedTextures[icon.name] = texture
          loadedCount++

          // Update state incrementally or at the end
          if (loadedCount === ICONS_DATA.length) {
            console.log("FloatingIcons: All textures loaded successfully!")
            setTextures({ ...loadedTextures })
          }
        },
        undefined,
        (err) => {
          console.error(`FloatingIcons: Failed to load texture for ${icon.name}:`, err)
        }
      )
    })

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  console.log(`FloatingIcons: Rendering with ${Object.keys(textures).length}/${ICONS_DATA.length} textures loaded`)

  return (
    <group>
      {ICONS_DATA.map((config) => (
        <FloatingCard
          key={config.name}
          texture={textures[config.name]}
          config={config}
          mouse={mouse}
        />
      ))}
    </group>
  )
}
