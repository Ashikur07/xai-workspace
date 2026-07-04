'use client'
import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'
import GlowButton from '@/components/ui/GlowButton'
import Badge from '@/components/ui/Badge'
import { easings } from '@/lib/constants'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/* ═══════════════════════════════════════════════════════════════
   Custom Shader Materials for particles and lines
   ═══════════════════════════════════════════════════════════════ */
const vertexShader = `
  attribute float aSize;
  attribute float aOpacity;
  attribute vec3 aColor;
  attribute vec3 aGridPosition;
  attribute float aIndex;

  varying vec3 vColor;
  varying float vOpacity;

  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    
    // Calculate noise based on time and index, fading out as progress reaches 1.0
    float noiseX = sin(uTime * 0.3 + aIndex * 0.01) * 0.04 * (1.0 - uProgress);
    float noiseY = cos(uTime * 0.2 + aIndex * 0.02) * 0.04 * (1.0 - uProgress);
    
    // Morph position between chaos (position) and grid positions (aGridPosition)
    vec3 mixedPos = mix(position, aGridPosition, uProgress);

    // Interactive mouse repulsion (fluid bubble effect)
    // Normalized mouse (-1 to 1) mapped to viewport coordinates at Z depth
    vec2 mouse3D = uMouse * vec2(4.5, 3.5);
    vec2 mouseDiff = mixedPos.xy - mouse3D;
    float mouseDist = length(mouseDiff);
    
    // Repulsion radius of 2.2 units
    float repulsionRadius = 2.2;
    float strength = (1.0 - smoothstep(0.0, repulsionRadius, mouseDist)) * 0.38 * (1.0 - uProgress * 0.5);
    
    // Numerically stable repulsion offset (avoiding division by zero)
    float within = step(mouseDist, repulsionRadius);
    vec2 dir = mouseDist > 0.0001 ? normalize(mouseDiff) : vec2(1.0, 0.0);
    mixedPos.xy += dir * strength * within;

    mixedPos.x += noiseX;
    mixedPos.y += noiseY;
    
    vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
    // Size with distance attenuation + subtle pulse
    float pulse = 1.0 + 0.15 * sin(uTime * 1.5 + mixedPos.x * 2.0 + mixedPos.y * 3.0);
    gl_PointSize = aSize * pulse * uPixelRatio * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  
  uniform float uProgress;

  void main() {
    // Soft circular point with glow falloff
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.15, d);
    
    // Morph base particle colors towards a sleek unified tech blue in grid mode
    vec3 gridColor = vec3(0.35, 0.55, 0.95);
    vec3 mixedColor = mix(vColor, gridColor, uProgress * 0.7);

    vec3 finalColor = mixedColor * (glow * 0.6 + core * 0.9);
    gl_FragColor = vec4(finalColor, vOpacity * glow);
  }
`

const lineVertexShader = `
  attribute vec3 aGridPosition;
  varying float vOpacity;

  uniform float uProgress;
  uniform float uTime;

  void main() {
    // Morph line positions along with the particles
    vec3 mixedPos = mix(position, aGridPosition, uProgress);
    
    // Dynamic waving noise in chaos mode
    float noiseX = sin(uTime * 0.25 + position.y * 0.5) * 0.03 * (1.0 - uProgress);
    float noiseY = cos(uTime * 0.2 + position.x * 0.5) * 0.03 * (1.0 - uProgress);
    mixedPos.x += noiseX;
    mixedPos.y += noiseY;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(mixedPos, 1.0);
  }
`

const lineFragmentShader = `
  uniform float uOpacity;
  void main() {
    // Sleek tech blueprint blue line color
    gl_FragColor = vec4(0.35, 0.55, 0.93, uOpacity);
  }
`

/* ═══════════════════════════════════════════════════════════════
   Particle system that morphs chaos → structured grid on scroll
   ═══════════════════════════════════════════════════════════════ */
function ParticleField({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const meshRef = useRef<THREE.Points>(null)
  const mouse = useMousePosition()
  const prefersReducedMotion = usePrefersReducedMotion()

  const COUNT = 1600

  const { chaosPos, gridPos, sizes, opacities, particleColors } = useMemo(() => {
    const chaos = new Float32Array(COUNT * 3)
    const grid = new Float32Array(COUNT * 3)
    const size = new Float32Array(COUNT)
    const opacity = new Float32Array(COUNT)
    const cols = new Float32Array(COUNT * 3)
    const cols2D = Math.ceil(Math.sqrt(COUNT))

    for (let i = 0; i < COUNT; i++) {
      // Chaos: random sphere with varying density
      const r = 3 + Math.pow(Math.random(), 0.6) * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      chaos[i * 3 + 2] = r * Math.cos(phi)

      // Grid: structured 2D grid with depth layers
      const col = i % cols2D
      const row = Math.floor(i / cols2D)
      const layer = Math.floor(Math.random() * 3) - 1
      grid[i * 3] = (col - cols2D / 2) * 0.2
      grid[i * 3 + 1] = (row - cols2D / 2) * 0.2
      grid[i * 3 + 2] = layer * 0.4

      // Varied sizes (0.3 - 1.6)
      size[i] = 0.3 + Math.pow(Math.random(), 2) * 1.3

      // Opacity variation
      opacity[i] = 0.4 + Math.random() * 0.6

      // Color: gradient from blue to purple to green
      const t = Math.random()
      if (t < 0.5) {
        // Blue range
        cols[i * 3] = 0.25 + t * 0.3
        cols[i * 3 + 1] = 0.45 + t * 0.3
        cols[i * 3 + 2] = 0.85 + t * 0.15
      } else if (t < 0.8) {
        // Purple range
        cols[i * 3] = 0.55 + (t - 0.5) * 0.4
        cols[i * 3 + 1] = 0.4 + (t - 0.5) * 0.25
        cols[i * 3 + 2] = 0.9
      } else {
        // Green accent (rare)
        cols[i * 3] = 0.2
        cols[i * 3 + 1] = 0.75 + (t - 0.8) * 0.5
        cols[i * 3 + 2] = 0.5
      }
    }
    return { chaosPos: chaos, gridPos: grid, sizes: size, opacities: opacity, particleColors: cols }
  }, [])

  const indexes = useMemo(() => {
    const arr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      arr[i] = i
    }
    return arr
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(chaosPos, 3))
    geo.setAttribute('aGridPosition', new THREE.BufferAttribute(gridPos, 3))
    geo.setAttribute('aIndex', new THREE.BufferAttribute(indexes, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(particleColors, 3))
    return geo
  }, [chaosPos, gridPos, indexes, sizes, opacities, particleColors])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1 },
  }), [])

  useFrame((state) => {
    if (!meshRef.current) return

    if (prefersReducedMotion) {
      uniforms.uProgress.value = 1.0
      uniforms.uTime.value = 0
      meshRef.current.rotation.y = 0
      meshRef.current.rotation.x = 0
      return
    }

    const t = scrollProgress.current ?? 0
    // Smooth ease in-out
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    // Update uniforms
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uProgress.value = ease

    // Interpolate mouse coordinates smoothly for spring-like fluid responsiveness
    const targetX = mouse.current.x
    const targetY = mouse.current.y
    uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.1
    uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.1

    // Gentle rotation + mouse parallax (subtler now that shader has physics)
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02 + uniforms.uMouse.value.x * 0.08
    meshRef.current.rotation.x = uniforms.uMouse.value.y * 0.04
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Constellation lines morphing from sphere cluster to grid mesh
   ═══════════════════════════════════════════════════════════════ */
function ConstellationLines({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const lineRef = useRef<THREE.LineSegments>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const { chaosPositions, gridPositions } = useMemo(() => {
    const NODES = 40
    const chaosNodes = new Float32Array(NODES * 3)
    const gridNodes = new Float32Array(NODES * 3)
    const cols = 7

    for (let i = 0; i < NODES; i++) {
      // Chaos position: random sphere with density
      const r = 2.8 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      chaosNodes[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      chaosNodes[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      chaosNodes[i * 3 + 2] = r * Math.cos(phi)

      // Grid position: structured coordinates matching the central grid
      const col = i % cols
      const row = Math.floor(i / cols)
      const layer = (i % 3) - 1
      gridNodes[i * 3] = (col - cols / 2) * 0.35
      gridNodes[i * 3 + 1] = (row - cols / 2) * 0.35
      gridNodes[i * 3 + 2] = layer * 0.4
    }

    // Connect node pairs that are close to each other in grid layout
    const lineChaos: number[] = []
    const lineGrid: number[] = []
    const THRESHOLD = 0.55

    for (let i = 0; i < NODES; i++) {
      for (let j = i + 1; j < NODES; j++) {
        const dx = gridNodes[i * 3] - gridNodes[j * 3]
        const dy = gridNodes[i * 3 + 1] - gridNodes[j * 3 + 1]
        const dz = gridNodes[i * 3 + 2] - gridNodes[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < THRESHOLD && lineChaos.length < 150) {
          lineChaos.push(
            chaosNodes[i * 3], chaosNodes[i * 3 + 1], chaosNodes[i * 3 + 2],
            chaosNodes[j * 3], chaosNodes[j * 3 + 1], chaosNodes[j * 3 + 2]
          )
          lineGrid.push(
            gridNodes[i * 3], gridNodes[i * 3 + 1], gridNodes[i * 3 + 2],
            gridNodes[j * 3], gridNodes[j * 3 + 1], gridNodes[j * 3 + 2]
          )
        }
      }
    }

    return {
      chaosPositions: new Float32Array(lineChaos),
      gridPositions: new Float32Array(lineGrid),
    }
  }, [])

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 0.05 },
  }), [])

  useFrame((state) => {
    if (!lineRef.current) return
    
    if (prefersReducedMotion) {
      uniforms.uProgress.value = 1.0
      uniforms.uTime.value = 0
      uniforms.uOpacity.value = 0.03
      lineRef.current.rotation.y = 0
      return
    }

    const t = scrollProgress.current ?? 0
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    
    uniforms.uProgress.value = ease
    uniforms.uTime.value = state.clock.elapsedTime
    
    // Keep lines extremely faint and subtle (around 0.05-0.06 max opacity)
    uniforms.uOpacity.value = 0.06 - ease * 0.03

    // Gentle rotation corresponding with the main field
    lineRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(chaosPositions, 3))
    g.setAttribute('aGridPosition', new THREE.BufferAttribute(gridPositions, 3))
    return g
  }, [chaosPositions, gridPositions])

  return (
    <lineSegments ref={lineRef} geometry={geo}>
      <shaderMaterial
        vertexShader={lineVertexShader}
        fragmentShader={lineFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Background grid (subtle)
   ═══════════════════════════════════════════════════════════════ */
function BackgroundGrid() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.008
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.06
    }
  })

  const lines = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number] }[] = []
    const size = 8, step = 1.8  // wider step = fewer lines = faster
    for (let i = -size; i <= size; i += step) {
      result.push({ start: [-size, i, 0], end: [size, i, 0] })
      result.push({ start: [i, -size, 0], end: [i, size, 0] })
    }
    return result
  }, [])

  // Pre-create Line objects to avoid SVG <line> type conflict
  const lineObjects = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#1A2235', transparent: true, opacity: 0.3 })
    return lines.map(l => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...l.start),
        new THREE.Vector3(...l.end),
      ])
      return new THREE.Line(geo, mat)
    })
  }, [lines])

  return (
    <group ref={groupRef} rotation={[0.5, 0, 0]} position={[0, 0, -5]}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Three.js Scene wrapper
   ═══════════════════════════════════════════════════════════════ */
function HeroScene() {
  const scrollProgressRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const t = window.scrollY / (window.innerHeight * 0.9)
      scrollProgressRef.current = Math.min(Math.max(t, 0), 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <ambientLight intensity={0.3} />
      <BackgroundGrid />
      <ConstellationLines scrollProgress={scrollProgressRef} />
      <ParticleField scrollProgress={scrollProgressRef} />
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          radius={0.6}
        />
      </EffectComposer>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Hero Component
   ═══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(true)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setLoaded(true)
    try {
      const canvas = document.createElement('canvas')
      const hasWebGL = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
      setWebglAvailable(hasWebGL)
    } catch (e) {
      setWebglAvailable(false)
    }
  }, [])

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  }
  
  const item = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  } : {
    hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
    show: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.8, ease: easings.smooth },
    },
  }

  return (
    <section id="hero" className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Floating ambient orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(91,141,239,0.08) 0%, transparent 65%)',
            top: '5%', left: '10%',
          }}
          animate={prefersReducedMotion ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)',
            bottom: '15%', right: '5%',
          }}
          animate={prefersReducedMotion ? {} : { x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* Full screen Three.js Canvas */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {loaded && webglAvailable ? (
          <Canvas
            camera={{ position: [0, 0, 8], fov: 55 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0C1118] via-[#060A0F] to-[#0C1118] opacity-60 flex items-center justify-center">
            {/* Static fallback glow orbs */}
            <div className="w-[500px] h-[500px] rounded-full blur-[120px] absolute top-[10%] left-[10%]"
              style={{ background: 'radial-gradient(circle, rgba(91,141,239,0.08) 0%, transparent 65%)' }} />
            <div className="w-[400px] h-[400px] rounded-full blur-[100px] absolute bottom-[15%] right-[5%]"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)' }} />
          </div>
        )}
      </div>

      {/* Dark radial overlay mask directly behind text for absolute legibility */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6,10,15,0.85) 0%, rgba(6,10,15,0.4) 60%, #060A0F 100%)',
        }}
      />

      {/* Content centered over the dark radial overlay */}
      <motion.div
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item} className="inline-flex items-center gap-2 mb-10">
          <Badge color="#5B8DEF" pulse variant="filled">
            <span>Intelligence Workspace</span>
            <span className="mx-2 opacity-30">·</span>
            <span style={{ color: '#8892A4' }}>v2.4 Live</span>
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div variants={item} className="mb-7">
          <h1 className="text-[clamp(2.8rem,7vw,6.2rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            <span className="block mb-1" style={{ color: '#E2E8F0' }}>Raw data.</span>
            <span className="block gradient-text">
              Real intelligence.
            </span>
          </h1>
        </motion.div>

        {/* Subtext - increased contrast slightly for readability */}
        <motion.p
          variants={item}
          className="text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-12"
          style={{ color: '#8892A4', fontWeight: 350 }}
        >
          Xai transforms unstructured data into structured intelligence —
          surfacing insight that drives decisions at the speed of thought.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex items-center justify-center gap-4 flex-wrap mb-20">
          <GlowButton>Start free trial</GlowButton>
          <GlowButton variant="secondary">
            Watch demo <span className="ml-1 opacity-50">→</span>
          </GlowButton>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={item}
          className="inline-flex items-center gap-8 md:gap-12 flex-wrap justify-center"
        >
          {[
            { value: '10M+',   label: 'Records processed' },
            { value: '99.4%',  label: 'Uptime SLA' },
            { value: '<200ms', label: 'Avg latency' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl md:text-2xl font-semibold font-mono tracking-tight gradient-text-accent">{stat.value}</p>
              <p className="text-xs mt-1 tracking-wide" style={{ color: '#4A5568' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.6 }}
      >
        <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#3E4A63]">Scroll</p>
        <div className="w-5 h-9 rounded-full border flex items-start justify-center pt-2" style={{ borderColor: '#1A2235' }}>
          <motion.div
            className="w-1 h-2 rounded-full"
            style={{ background: '#5B8DEF' }}
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Bottom section gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, #060A0F)' }}
      />
    </section>
  )
}
