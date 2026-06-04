'use client'

import { useEffect } from 'react'

export default function RippleProvider() {
  useEffect(() => {
    function spawnRipple(x: number, y: number) {
      const el = document.createElement('span')
      el.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: radial-gradient(circle, rgba(90,158,80,0.30) 0%, rgba(168,197,160,0.12) 50%, transparent 70%);
        animation: momentRipple 0.75s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
      `
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove(), { once: true })
    }

    function onPointerDown(e: PointerEvent) {
      // Skip inputs and textareas — they have their own focus feedback
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      spawnRipple(e.clientX, e.clientY)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return null
}