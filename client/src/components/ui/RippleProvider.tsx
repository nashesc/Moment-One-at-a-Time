'use client'

import { useEffect, useRef } from 'react'

const POOL_SIZE = 3

export default function RippleProvider() {
  const poolIndexRef = useRef(0)

  useEffect(() => {
    // Pool of reusable elements instead of creating + destroying
    // a new DOM node on every tap (kills GC churn on low-RAM devices).
    const pool: HTMLSpanElement[] = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = document.createElement('span')
      el.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(90,158,80,0.30) 0%, rgba(168,197,160,0.12) 50%, transparent 70%);
        opacity: 0;
        left: -9999px;
        top: -9999px;
      `
      document.body.appendChild(el)
      pool.push(el)
    }

    function spawnRipple(x: number, y: number) {
      const el = pool[poolIndexRef.current % pool.length]
      poolIndexRef.current++

      el.getAnimations().forEach(a => a.cancel())
      el.style.left = `${x}px`
      el.style.top = `${y}px`

      el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          { transform: 'translate(-50%, -50%) scale(28)', opacity: 0.6, offset: 0.6 },
          { transform: 'translate(-50%, -50%) scale(45)', opacity: 0 },
        ],
        { duration: 750, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)' }
      )
    }

    function onPointerDown(e: PointerEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      spawnRipple(e.clientX, e.clientY)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      pool.forEach(el => el.remove())
    }
  }, [])

  return null
}