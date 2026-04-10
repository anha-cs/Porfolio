import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'

// Layer 1 - Base Background (slate-950 → indigo-950 → slate-950)
const BaseBackground = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none"
    style={{
      background: 'linear-gradient(to bottom, rgb(2 6 23), rgb(30 27 75), rgb(2 6 23))'
    }}
  />
)

// Layer 2 - Nebula Clouds
const NebulaClouds = () => (
  <>
    <motion.div
      className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
      style={{ background: 'rgba(147, 51, 234, 0.2)' }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
        x: [0, 50, 0],
        y: [0, -30, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
      style={{ background: 'rgba(37, 99, 235, 0.2)' }}
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.2, 0.4],
        x: [0, -40, 0],
        y: [0, 50, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none"
      style={{ background: 'rgba(219, 39, 119, 0.15)' }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.15, 0.3, 0.15]
      }}
      transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
    />
  </>
)

// Layer 3 - Twinkling Stars
const TwinklingStars = () => {
  const stars = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2
    })),
    []
  )

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  )
}

// Layer 4 - Shooting Stars
const ShootingStars = () => {
  const [shootingStars, setShootingStars] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now()
      const startX = Math.random() * 100
      const startY = Math.random() * 50

      setShootingStars((prev) => [...prev, { id, startX, startY }])

      setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== id))
      }, 1500)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute pointer-events-none"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: 80,
            height: 2
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: 200,
            y: 200
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.9), transparent)'
            }}
          />
        </motion.div>
      ))}
    </>
  )
}

// Layer 5 - Constellation Lines
const ConstellationLines = () => {
  const paths = [
    { d: 'M 10 20 L 100 50 L 180 30 L 250 80', delay: 0 },
    { d: 'M 250 80 L 320 120 L 400 90', delay: 0.5 },
    { d: 'M 400 90 L 450 150 L 500 100', delay: 1 },
    { d: 'M 150 200 L 220 180 L 300 220', delay: 1.5 },
    { d: 'M 300 220 L 350 280 L 420 250', delay: 2 },
    { d: 'M 80 300 L 150 320 L 200 280', delay: 2.5 }
  ]

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.2 }}>
      {paths.map((path, i) => (
        <motion.path
          key={i}
          d={path.d}
          fill="none"
          stroke="white"
          strokeWidth={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            delay: path.delay,
            repeat: Infinity,
            repeatDelay: 3
          }}
        />
      ))}
    </svg>
  )
}

// Layer 6 - Floating Planets
const FloatingPlanets = () => {
  const planets = [
    { size: 120, gradient: 'linear-gradient(135deg, #f97316, #dc2626)', x: '15%', y: '20%', duration: 20, hasRing: true },
    { size: 80, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', x: '75%', y: '25%', duration: 25, hasRing: false },
    { size: 60, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', x: '85%', y: '60%', duration: 30, hasRing: true },
    { size: 100, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', x: '25%', y: '70%', duration: 22, hasRing: false },
    { size: 50, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', x: '60%', y: '80%', duration: 35, hasRing: true }
  ]

  return (
    <>
      {planets.map((planet, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: planet.x,
            top: planet.y,
            width: planet.size,
            height: planet.size,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            y: [-30, 30, -30],
            x: [20, -20, 20],
            rotate: [0, 360]
          }}
          transition={{
            duration: planet.duration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {planet.hasRing && (
            <div
              className="absolute rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: planet.size * 1.8,
                height: planet.size * 0.25,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotateX(70deg) rotateZ(-20deg)'
              }}
            />
          )}
          <div
            className="relative w-full h-full rounded-full overflow-hidden blur-[0px]"
            style={{
              background: planet.gradient,
              boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.4), inset 4px 4px 12px rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute w-2 h-2 rounded-full bg-black/40" style={{ top: '20%', left: '30%' }} />
            <div className="absolute w-3 h-3 rounded-full bg-black/30" style={{ top: '60%', right: '25%' }} />
          </div>
          {i === 0 && (
            <motion.div
              className="absolute w-[70px] h-[70px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transformOrigin: 'center center' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="absolute w-[6px] h-[6px] rounded-full bg-gray-400 left-1/2 -top-[3px] -translate-x-1/2"
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </>
  )
}

// Layer 7 - Asteroid Belt
const AsteroidBelt = () => {
  const asteroids = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: 45 + Math.random() * 10,
      top: 45 + Math.random() * 10,
      yOffset: (Math.random() - 0.5) * 20,
      xOffset: (Math.random() - 0.5) * 30,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5
    })),
    []
  )

  return (
    <>
      {asteroids.map((asteroid) => (
        <motion.div
          key={asteroid.id}
          className="absolute w-[2px] h-2 rounded-sm bg-gray-500 pointer-events-none"
          style={{
            left: `${asteroid.left}%`,
            top: `${asteroid.top}%`
          }}
          animate={{
            rotate: 360,
            y: [0, asteroid.yOffset, 0],
            x: [0, asteroid.xOffset, 0]
          }}
          transition={{
            duration: asteroid.duration,
            delay: asteroid.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  )
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      <BaseBackground />
      <NebulaClouds />
      <TwinklingStars />
      <ShootingStars />
      <ConstellationLines />
      <FloatingPlanets />
      <AsteroidBelt />
    </div>
  )
}
