'use client'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useLenis } from '@/components/providers/GSAPProvider'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false) // Mobile dropdown state
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  const lenis = useLenis()

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (lenis) {
      lenis.scrollTo(href, { offset: -80, duration: 1.2 })
    } else {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Pipeline', href: '#platform' },
    { label: 'Dashboard', href: '#insights' },
    { label: 'Interaction', href: '#docs' }
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <motion.nav
        className="w-full max-w-5xl rounded-full border pointer-events-auto flex items-center justify-between px-6 py-2.5 transition-all duration-500 relative"
        style={{
          background: scrolled 
            ? 'rgba(6, 10, 15, 0.75)' 
            : 'rgba(6, 10, 15, 0.4)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderColor: scrolled 
            ? 'rgba(91, 141, 239, 0.2)' 
            : 'rgba(26, 34, 53, 0.6)',
          boxShadow: scrolled 
            ? '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(91, 141, 239, 0.05)' 
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          y: scrolled ? 6 : 0,
        }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        {/* Left: Logo & Status Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)' }}>
            <span className="text-white font-bold text-sm font-mono relative z-10">X</span>
            {/* Inner logo shine overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_60%)]" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-[#E2E8F0] leading-none">Xai</span>
            <span className="text-[10px] text-[#6B7A99] tracking-wider mt-0.5 font-mono uppercase hidden sm:inline-flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              Node Active
            </span>
          </div>
        </div>

        {/* Middle: Floating Interactive Navigation Links */}
        <div className="hidden md:flex items-center gap-1 relative px-1 py-1 rounded-full bg-[#0A0F16]/40 border border-[#1A2235]/40">
          {navLinks.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className="relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-300 select-none cursor-pointer"
              style={{
                color: hoveredIndex === index ? '#E2E8F0' : '#8892A4',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileTap={{ scale: 0.95 }}
            >
              {/* Dynamic Sliding Capsule Bubble */}
              {hoveredIndex === index && (
                <motion.div
                  layoutId="navSlidingBubble"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    background: 'rgba(91, 141, 239, 0.08)',
                    border: '1px solid rgba(91, 141, 239, 0.12)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* Right: CTA & Interactive Action buttons */}
        <div className="flex items-center gap-3">
          <motion.a
            href="#signin"
            className="text-xs font-mono text-[#6B7A99] hover:text-[#E2E8F0] transition-colors duration-200 hidden sm:inline-block"
            whileHover={{ y: -0.5 }}
          >
            [ Sign In ]
          </motion.a>
          
          <motion.button
            className="relative px-4 py-1.5 rounded-full text-xs font-semibold overflow-hidden group shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #1A2235 0%, #0A0F16 100%)',
              border: '1px solid rgba(91, 141, 239, 0.25)',
              color: '#F8FAFC',
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: '0 0 15px rgba(91,141,239,0.3)',
              borderColor: 'rgba(91, 141, 239, 0.5)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            Get Access
          </motion.button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 rounded-full border border-[#1A2235] bg-[#0A0F16]/60 hover:bg-[#111927] transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className={`w-3.5 h-[1.5px] bg-[#E2E8F0] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[1px]' : '-translate-y-[2px]'}`} />
            <span className={`w-3.5 h-[1.5px] bg-[#E2E8F0] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[0.5px]' : 'translate-y-[2px]'}`} />
          </button>
        </div>

        {/* Mobile dropdown menu (clip-path anim expansion) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[110%] left-0 right-0 p-4 rounded-3xl border border-[#1A2235] bg-[#060A0F]/95 backdrop-blur-xl flex flex-col gap-3 md:hidden shadow-2xl"
            >
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    setIsOpen(false)
                    handleLinkClick(e, item.href)
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#8892A4] hover:text-[#E2E8F0] hover:bg-[#111927] transition-all duration-200 cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-[#1A2235] my-1" />
              <div className="flex justify-between items-center px-4 py-2">
                <a href="#signin" className="text-xs font-mono text-[#6B7A99] hover:text-[#E2E8F0]">
                  [ Sign In ]
                </a>
                <button
                  className="px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)',
                    color: '#FFF',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Get Access
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}
