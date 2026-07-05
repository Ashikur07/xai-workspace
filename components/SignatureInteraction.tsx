'use client'
import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'
import SectionHeader from '@/components/ui/SectionHeader'
import { easings, colors } from '@/lib/constants'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsExport } from '@/hooks/useIsExport'

type MorphState = 'sphere' | 'cube' | 'torus'

/* ═══════════════════════════════════════════════════════════════
   Custom Shader for morphing particles with vertex colors
   ═══════════════════════════════════════════════════════════════ */
const morphVertexShader = `
  attribute float aSize;
  attribute float aRandom;
  
  attribute vec3 aPositionSphere;
  attribute vec3 aPositionCube;
  attribute vec3 aPositionTorus;
  
  attribute vec3 aColorSphere;
  attribute vec3 aColorCube;
  attribute vec3 aColorTorus;

  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float uTime;
  uniform float uMorphProgress;
  uniform float uPixelRatio;
  
  uniform float uWeightSphere;
  uniform float uWeightCube;
  uniform float uWeightTorus;
  uniform vec2 uMouse;

  void main() {
    // Combine positions based on current state weights
    vec3 basePos = aPositionSphere * uWeightSphere +
                   aPositionCube * uWeightCube +
                   aPositionTorus * uWeightTorus;
                   
    // Combine colors based on current state weights
    vColor = aColorSphere * uWeightSphere +
             aColorCube * uWeightCube +
             aColorTorus * uWeightTorus;
             
    // Mouse repulsion in vertex shader
    vec2 mousePos = uMouse * 3.0;
    float d = distance(basePos.xy, mousePos);
    if (d < 2.0) {
      // Direct smooth repulsion away from mouse
      float force = (1.0 - d / 2.0) * 0.15;
      if (d > 0.0001) {
        basePos.xy += normalize(basePos.xy - mousePos) * force;
      } else {
        basePos.x += force;
      }
    }

    float pulse = 1.0 + 0.2 * sin(uTime * 2.0 + aRandom * 6.28);
    // During morph, particles get slight extra glow
    float morphGlow = 1.0 + uMorphProgress * 0.3 * sin(uTime * 4.0 + aRandom * 12.0);
    vAlpha = 0.45 + 0.25 * pulse * morphGlow;

    vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
    gl_PointSize = aSize * pulse * uPixelRatio * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const morphFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.12, d);
    vec3 finalColor = vColor * (glow * 0.5 + core * 1.0);
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`

/* ═══════════════════════════════════════════════════════════════
   Wireframe connecting lines between nearby particles
   ═══════════════════════════════════════════════════════════════ */
function WireframeLines({
  currentWeights,
  positions
}: {
  currentWeights: React.MutableRefObject<{ sphere: number; cube: number; torus: number }>
  positions: Record<MorphState, Float32Array>
}) {
  const lineRef = useRef<THREE.LineSegments>(null)
  const currentPositions = useMemo(() => new Float32Array(80 * 3), [])

  const NODES = 80
  const THRESHOLD = 2.2

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Pre-allocate max lines
    const maxLines = 300
    const linePos = new Float32Array(maxLines * 6) // 2 verts * 3 coords per line
    geo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    geo.setDrawRange(0, 0)
    return geo
  }, [])

  const prefersReducedMotion = usePrefersReducedMotion()
  const lastWeights = useRef({ sphere: -1, cube: -1, torus: -1 })

  useFrame(() => {
    if (!lineRef.current) return
    const pos = lineRef.current.geometry.attributes.position

    const wSphere = currentWeights.current.sphere
    const wCube = currentWeights.current.cube
    const wTorus = currentWeights.current.torus

    if (prefersReducedMotion) {
      if (
        lastWeights.current.sphere === wSphere &&
        lastWeights.current.cube === wCube &&
        lastWeights.current.torus === wTorus
      ) {
        return
      }
      lastWeights.current = { sphere: wSphere, cube: wCube, torus: wTorus }
    }

    // Calculate node positions directly by combining the weighted states
    for (let i = 0; i < NODES; i++) {
      const i3 = i * 3
      currentPositions[i3] =
        positions.sphere[i3] * wSphere +
        positions.cube[i3] * wCube +
        positions.torus[i3] * wTorus

      currentPositions[i3 + 1] =
        positions.sphere[i3 + 1] * wSphere +
        positions.cube[i3 + 1] * wCube +
        positions.torus[i3 + 1] * wTorus

      currentPositions[i3 + 2] =
        positions.sphere[i3 + 2] * wSphere +
        positions.cube[i3 + 2] * wCube +
        positions.torus[i3 + 2] * wTorus
    }

    // Rebuild connections
    let lineCount = 0
    const MAX_LINES = 300
    for (let i = 0; i < NODES && lineCount < MAX_LINES; i++) {
      for (let j = i + 1; j < NODES && lineCount < MAX_LINES; j++) {
        const dx = currentPositions[i * 3] - currentPositions[j * 3]
        const dy = currentPositions[i * 3 + 1] - currentPositions[j * 3 + 1]
        const dz = currentPositions[i * 3 + 2] - currentPositions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < THRESHOLD) {
          const idx = lineCount * 6
          pos.array[idx] = currentPositions[i * 3]
          pos.array[idx + 1] = currentPositions[i * 3 + 1]
          pos.array[idx + 2] = currentPositions[i * 3 + 2]
          pos.array[idx + 3] = currentPositions[j * 3]
          pos.array[idx + 4] = currentPositions[j * 3 + 1]
          pos.array[idx + 5] = currentPositions[j * 3 + 2]
          lineCount++
        }
      }
    }

    lineRef.current.geometry.setDrawRange(0, lineCount * 2)
    pos.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} geometry={lineGeometry}>
      <lineBasicMaterial
        color="#5B8DEF"
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Morphing particle mesh with vertex colors and mouse interaction
   ═══════════════════════════════════════════════════════════════ */
function MorphMesh({ morphTo }: { morphTo: MorphState }) {
  const meshRef = useRef<THREE.Points>(null)
  const targetWeights = useRef({ sphere: 1, cube: 0, torus: 0 })
  const currentWeights = useRef({ sphere: 1, cube: 0, torus: 0 })
  const morphProgress = useRef(0)
  const mouse = useMousePosition()

  const COUNT = 4000

  const STATE_COLORS: Record<MorphState, [number, number, number]> = {
    sphere: [0.36, 0.55, 0.94],  // Blue
    cube: [0.65, 0.55, 0.98],    // Purple
    torus: [0.2, 0.83, 0.6],     // Green
  }

  const { positions, colors, sizes, randoms } = useMemo(() => {
    const sphere = new Float32Array(COUNT * 3)
    const cube = new Float32Array(COUNT * 3)
    const torus = new Float32Array(COUNT * 3)

    const colorsSphere = new Float32Array(COUNT * 3)
    const colorsCube = new Float32Array(COUNT * 3)
    const colorsTorus = new Float32Array(COUNT * 3)

    const sz = new Float32Array(COUNT)
    const rnd = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Sizes and randoms
      sz[i] = 0.4 + Math.pow(Math.random(), 2) * 1.2
      rnd[i] = Math.random()

      // Sphere
      const r = 2.2
      const u = Math.random(), v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      sphere[i * 3 + 2] = r * Math.cos(phi)

      // Cube surface
      const face = Math.floor(Math.random() * 6)
      const a = (Math.random() - 0.5) * 4
      const b = (Math.random() - 0.5) * 4
      const c = 2
      if (face === 0) { cube[i * 3] = c; cube[i * 3 + 1] = a; cube[i * 3 + 2] = b }
      else if (face === 1) { cube[i * 3] = -c; cube[i * 3 + 1] = a; cube[i * 3 + 2] = b }
      else if (face === 2) { cube[i * 3] = a; cube[i * 3 + 1] = c; cube[i * 3 + 2] = b }
      else if (face === 3) { cube[i * 3] = a; cube[i * 3 + 1] = -c; cube[i * 3 + 2] = b }
      else if (face === 4) { cube[i * 3] = a; cube[i * 3 + 1] = b; cube[i * 3 + 2] = c }
      else { cube[i * 3] = a; cube[i * 3 + 1] = b; cube[i * 3 + 2] = -c }

      // Torus
      const torusR = 2, tubeR = 0.7
      const tu = Math.random() * Math.PI * 2
      const tv = Math.random() * Math.PI * 2
      torus[i * 3] = (torusR + tubeR * Math.cos(tv)) * Math.cos(tu)
      torus[i * 3 + 1] = (torusR + tubeR * Math.cos(tv)) * Math.sin(tu)
      torus[i * 3 + 2] = tubeR * Math.sin(tv)

      // Colors Sphere
      colorsSphere[i * 3] = STATE_COLORS.sphere[0] + (Math.random() - 0.5) * 0.15
      colorsSphere[i * 3 + 1] = STATE_COLORS.sphere[1] + (Math.random() - 0.5) * 0.15
      colorsSphere[i * 3 + 2] = STATE_COLORS.sphere[2] + (Math.random() - 0.5) * 0.1

      // Colors Cube
      colorsCube[i * 3] = STATE_COLORS.cube[0] + (Math.random() - 0.5) * 0.15
      colorsCube[i * 3 + 1] = STATE_COLORS.cube[1] + (Math.random() - 0.5) * 0.15
      colorsCube[i * 3 + 2] = STATE_COLORS.cube[2] + (Math.random() - 0.5) * 0.1

      // Colors Torus
      colorsTorus[i * 3] = STATE_COLORS.torus[0] + (Math.random() - 0.5) * 0.15
      colorsTorus[i * 3 + 1] = STATE_COLORS.torus[1] + (Math.random() - 0.5) * 0.15
      colorsTorus[i * 3 + 2] = STATE_COLORS.torus[2] + (Math.random() - 0.5) * 0.1
    }
    return { positions: { sphere, cube, torus }, colors: { sphere: colorsSphere, cube: colorsCube, torus: colorsTorus }, sizes: sz, randoms: rnd }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.sphere, 3))
    geo.setAttribute('aPositionSphere', new THREE.BufferAttribute(positions.sphere, 3))
    geo.setAttribute('aPositionCube', new THREE.BufferAttribute(positions.cube, 3))
    geo.setAttribute('aPositionTorus', new THREE.BufferAttribute(positions.torus, 3))
    geo.setAttribute('aColorSphere', new THREE.BufferAttribute(colors.sphere, 3))
    geo.setAttribute('aColorCube', new THREE.BufferAttribute(colors.cube, 3))
    geo.setAttribute('aColorTorus', new THREE.BufferAttribute(colors.torus, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    return geo
  }, [positions, colors, sizes, randoms])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphProgress: { value: 0 },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    uWeightSphere: { value: 1 },
    uWeightCube: { value: 0 },
    uWeightTorus: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useEffect(() => {
    targetWeights.current = {
      sphere: morphTo === 'sphere' ? 1 : 0,
      cube: morphTo === 'cube' ? 1 : 0,
      torus: morphTo === 'torus' ? 1 : 0,
    }
    morphProgress.current = 1
  }, [morphTo])

  const prefersReducedMotion = usePrefersReducedMotion()

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    if (prefersReducedMotion) {
      // Instantly switch weights on CPU, avoiding transition animations
      currentWeights.current.sphere = targetWeights.current.sphere
      currentWeights.current.cube = targetWeights.current.cube
      currentWeights.current.torus = targetWeights.current.torus

      uniforms.uTime.value = 0
      uniforms.uMorphProgress.value = 0
      uniforms.uWeightSphere.value = currentWeights.current.sphere
      uniforms.uWeightCube.value = currentWeights.current.cube
      uniforms.uWeightTorus.value = currentWeights.current.torus
      uniforms.uMouse.value.set(0, 0)

      meshRef.current.rotation.y = 0.5
      meshRef.current.rotation.x = 0.3
      return
    }

    // Lerp weights on CPU
    currentWeights.current.sphere += (targetWeights.current.sphere - currentWeights.current.sphere) * 0.04
    currentWeights.current.cube += (targetWeights.current.cube - currentWeights.current.cube) * 0.04
    currentWeights.current.torus += (targetWeights.current.torus - currentWeights.current.torus) * 0.04

    // Decay morph progress
    morphProgress.current *= 0.98

    // Update uniforms
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uMorphProgress.value = morphProgress.current
    uniforms.uWeightSphere.value = currentWeights.current.sphere
    uniforms.uWeightCube.value = currentWeights.current.cube
    uniforms.uWeightTorus.value = currentWeights.current.torus
    uniforms.uMouse.value.set(mouse.current.x, mouse.current.y)

    // Rotation with mouse influence
    meshRef.current.rotation.y = clock.elapsedTime * 0.1 + mouse.current.x * 0.4
    meshRef.current.rotation.x = clock.elapsedTime * 0.06 + mouse.current.y * 0.2
  })

  return (
    <>
      <points ref={meshRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={morphVertexShader}
          fragmentShader={morphFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <WireframeLines currentWeights={currentWeights} positions={positions} />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Scene with post-processing
   ═══════════════════════════════════════════════════════════════ */
function MorphScene({ morphTo }: { morphTo: MorphState }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight
        position={[4, 4, 4]}
        intensity={1.2}
        color={morphTo === 'sphere' ? '#5B8DEF' : morphTo === 'cube' ? '#A78BFA' : '#34D399'}
      />
      <MorphMesh morphTo={morphTo} />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   State info & labels with specific custom metrics
   ═══════════════════════════════════════════════════════════════ */
interface MetricData {
  label: string
  value: string
}

const STATE_INFO: Record<
  MorphState,
  { label: string; desc: string; color: string; icon: string; metrics: MetricData[] }
> = {
  sphere: {
    label: 'Raw Data',
    desc: 'Unstructured, distributed, noisy — data in its natural state before processing.',
    color: colors.accent,
    icon: '◉',
    metrics: [
      { label: 'Entropy', value: '0.94' },
      { label: 'Noise Floor', value: '-48 dB' },
      { label: 'Symmetry', value: '12%' },
    ],
  },
  cube: {
    label: 'Structured Intelligence',
    desc: 'Data organized into clean, queryable, classified structures ready for analysis.',
    color: colors.purple,
    icon: '◧',
    metrics: [
      { label: 'Entropy', value: '0.08' },
      { label: 'Symmetry', value: '99.2%' },
      { label: 'Dimensions', value: '3D Grid' },
    ],
  },
  torus: {
    label: 'Continuous Flow',
    desc: 'Intelligence in motion — flowing through automated pipelines into looping actions.',
    color: colors.green,
    icon: '◎',
    metrics: [
      { label: 'Throughput', value: '4.8 GB/s' },
      { label: 'Topology', value: 'Genus 1' },
      { label: 'Latency', value: '0.8 ms' },
    ],
  },
}

const MORPH_ORDER: MorphState[] = ['sphere', 'cube', 'torus']

/* ═══════════════════════════════════════════════════════════════
   Main Signature Interaction Component
   ═══════════════════════════════════════════════════════════════ */
export default function SignatureInteraction() {
  const [morphTo, setMorphTo] = useState<MorphState>('sphere')
  const [loaded, setLoaded] = useState(false)
  const [webglAvailable, setWebGLAvailable] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isExport = useIsExport()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setLoaded(true)
    try {
      const canvas = document.createElement('canvas')
      const hasWebGL = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
      setWebGLAvailable(hasWebGL)
    } catch (e) {
      setWebGLAvailable(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') || params.get('activeTab') || params.get('morph')
      if (tabParam) {
        const lowerParam = tabParam.toLowerCase()
        if (lowerParam === '1' || lowerParam === 'structured' || lowerParam === 'cube' || lowerParam === 'structuredintelligence') {
          setMorphTo('cube')
        } else if (lowerParam === '2' || lowerParam === 'continuous' || lowerParam === 'torus' || lowerParam === 'continuousflow') {
          setMorphTo('torus')
        } else if (lowerParam === '0' || lowerParam === 'raw' || lowerParam === 'sphere' || lowerParam === 'rawdata') {
          setMorphTo('sphere')
        }
      }
    }
  }, [])

  const startCycle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (prefersReducedMotion || isExport) return // disable auto-cycle for reduced motion or export mode
    
    intervalRef.current = setInterval(() => {
      setMorphTo(prev => {
        const i = MORPH_ORDER.indexOf(prev)
        return MORPH_ORDER[(i + 1) % MORPH_ORDER.length]
      })
    }, 4000)
  }

  // Manage auto-cycling based on user hover state to let interactive intent win
  useEffect(() => {
    if (isExport) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    if (isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current)
    } else {
      startCycle()
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isHovered, prefersReducedMotion, isExport])

  const handleCanvasClick = () => {
    setMorphTo(prev => {
      const i = MORPH_ORDER.indexOf(prev)
      return MORPH_ORDER[(i + 1) % MORPH_ORDER.length]
    })
  }

  const info = STATE_INFO[morphTo]

  return (
    <section className="relative py-32 px-6 overflow-hidden grid-bg">
      {/* Background glow radial tint */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${info.color}05 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="Signature Interaction"
          title="Data takes shape"
          description="Watch intelligence transform in real-time. Move your cursor. Click to morph."
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 3D Canvas Wrapper — clean transparent background */}
          <div 
            className="relative cursor-pointer" 
            style={{ height: 440 }}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onClick={handleCanvasClick}
            aria-hidden="true"
          >
            {loaded && webglAvailable ? (
              <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
              >
                <Suspense fallback={null}>
                  <MorphScene morphTo={morphTo} />
                </Suspense>
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center border border-border bg-surface/40 rounded-2xl p-6">
                <div className="text-center">
                  <motion.div
                    key={morphTo}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 mx-auto rounded-full border border-dashed flex items-center justify-center"
                    style={{ borderColor: info.color, color: info.color, background: `${info.color}05` }}
                  >
                    {morphTo === 'sphere' && (
                      <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
                        <ellipse cx="50" cy="50" rx="40" ry="15" />
                        <ellipse cx="50" cy="50" rx="15" ry="40" />
                      </svg>
                    )}
                    {morphTo === 'cube' && (
                      <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="20" y="20" width="50" height="50" rx="2" />
                        <rect x="30" y="30" width="50" height="50" rx="2" strokeDasharray="3 3" />
                        <line x1="20" y1="20" x2="30" y2="30" />
                        <line x1="70" y1="20" x2="80" y2="30" />
                        <line x1="20" y1="70" x2="30" y2="80" />
                        <line x1="70" y1="70" x2="80" y2="80" />
                      </svg>
                    )}
                    {morphTo === 'torus' && (
                      <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="50" cy="50" r="40" />
                        <circle cx="50" cy="50" r="20" strokeDasharray="3 3" />
                      </svg>
                    )}
                  </motion.div>
                  <p className="mt-6 text-sm font-semibold text-text">{info.label} (Fallback Visual)</p>
                  <p className="mt-2 text-xs font-mono text-muted">WebGL unavailable — showing static vector representation</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Info Panel */}
          <div>
            {/* Morph state buttons */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {MORPH_ORDER.map((s) => {
                const active = morphTo === s
                const si = STATE_INFO[s]
                return (
                  <motion.button
                    key={s}
                    onClick={() => { setMorphTo(s); startCycle() }}
                    className="relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    style={{
                      background: active ? `${si.color}12` : 'transparent',
                      border: `1px solid ${active ? si.color + '40' : colors.border}`,
                      color: active ? si.color : colors.muted,
                      boxShadow: active ? `0 0 24px ${si.color}12` : 'none',
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="mr-2">{si.icon}</span>
                    {si.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Dynamic Info Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={morphTo}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: info.color, boxShadow: `0 0 8px ${info.color}60` }}
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="font-mono text-xs tracking-widest uppercase" style={{ color: info.color }}>
                    Current state
                  </p>
                </div>
                <h3 className="text-3xl font-semibold text-text mb-3">
                  {info.label}
                </h3>
                <p className="text-dim leading-relaxed mb-8 text-sm md:text-base">
                  {info.desc}
                </p>

                {/* State-specific metrics grid */}
                <div className="grid grid-cols-3 gap-4">
                  {info.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-border p-4 text-center transition-all duration-300 bg-[#0A0F16]"
                    >
                      <p className="text-lg md:text-xl font-semibold font-mono tracking-tight" style={{ color: info.color }}>
                        {m.value}
                      </p>
                      <p className="text-[11px] text-muted mt-1 font-mono uppercase tracking-wider">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
