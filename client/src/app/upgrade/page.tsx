'use client'

// client/src/app/upgrade/page.tsx

import { useState, useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Check, X, Leaf, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import { usePlan } from '@/context/PlanContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

declare global {
  interface Window { Paddle: any }
}

// ─── Price IDs ───────────────────────────────────────────────────────────────
const IS_SANDBOX = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox'

const MONTHLY_PRICE_ID = IS_SANDBOX
  ? 'pri_01ktmpwj7n2t5dpvqtpc8ks1hc'   // from Paddle sandbox dashboard
  : 'pri_01ktmjpyfxw8p6hh9v8xnqta1n'

const ANNUAL_PRICE_ID = IS_SANDBOX
  ? 'pri_01ktmpxjwcmken0rajnsj8wff1'    // from Paddle sandbox dashboard
  : 'pri_01ktmjrvrvee06j7r9r9kyzmz7'

const DISCOUNT_CODE    = 'EARLY50'

// ─── Feature list ────────────────────────────────────────────────────────────
const FEATURES = [
  { label: 'Tasks per day',            free: '7 max',             pro: 'Unlimited'         },
  { label: 'Task history',             free: 'Today & Yesterday', pro: 'All time'          },
  { label: 'Recap periods',            free: 'Daily & Weekly',    pro: 'Daily · Weekly · Monthly · Yearly' },
  { label: 'Reflections history',      free: 'Last 15',           pro: 'Full history'      },
  { label: 'Focus music library',      free: '21 tracks',         pro: '100+ tracks'       },
  { label: 'Music favorites',          free: false,               pro: true                },
  { label: 'Push notifications',       free: false,               pro: true                },
  { label: 'Dark mode',                free: false,               pro: 'Coming soon'       },
  { label: 'Data export (CSV)',         free: false,              pro: true                },
  { label: 'Full opening quote library',free: false,              pro: true                },
]

type PlanType = 'monthly' | 'annual'

export default function UpgradePage() {
  const { isPro, isTrialActive, trialDaysLeft, plan, refresh } = usePlan()
  const { profile } = useAuth()

  const [paddleReady,  setPaddleReady]  = useState(false)
  const [paddleFailed, setPaddleFailed] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual')
  const [success,      setSuccess]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const paddleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // ─── Init Paddle ────────────────────────────────────────────────────────
  const initPaddle = useCallback(() => {
    if (!window.Paddle) return
    if (paddleTimeoutRef.current) clearTimeout(paddleTimeoutRef.current)
    console.log('Paddle env:', IS_SANDBOX)
    console.log('Token prefix:', process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.slice(0, 10))

    if (IS_SANDBOX) {
        window.Paddle.Environment.set('sandbox')
    }

    window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: (event: any) => {
          if (event.name === 'checkout.completed') {
            setCheckoutOpen(false)

            let attempts = 0
            if (pollRef.current) clearInterval(pollRef.current)
            pollRef.current = setInterval(async () => {
              attempts++
              await refresh()
              const res = await apiFetch<{ isPro: boolean }>('/api/plan')
              if (res.isPro || attempts >= 15) {
                clearInterval(pollRef.current!)
                pollRef.current = null
                setSuccess(true)
              }
            }, 2000)
          }
          if (event.name === 'checkout.loaded') {
          setLoading(false)
          }
        },
    })
    setPaddleReady(true)
    }, [refresh])

    useEffect(() => {
      paddleTimeoutRef.current = setTimeout(() => {
        if (!paddleReady) setPaddleFailed(true)
      }, 8000)
      return () => { if (paddleTimeoutRef.current) clearTimeout(paddleTimeoutRef.current) }
    }, [paddleReady])

  // ─── Open checkout ──────────────────────────────────────────────────────
  const openCheckout = useCallback((p: PlanType) => {
    if (!window.Paddle || !paddleReady) return

    setSelectedPlan(p)
    setCheckoutOpen(true)
    setLoading(true)

    // Let React render the checkout container div first
    setTimeout(() => {
      window.Paddle.Checkout.open({
        settings: {
          displayMode:         'inline',
          frameTarget:         'paddle-checkout-frame',
          frameInitialHeight:  450,
          frameStyle:          'width: 100%; background-color: transparent; border: none;',
          allowLogout:         false,
          theme:               'light',
        },
        items: [{ priceId: p === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID, quantity: 1 }],
        customer:   { email: profile?.email ?? '' },
        customData: { user_id: profile?.id ?? '' },
        // EARLY50 applies to monthly only
        ...(p === 'monthly' ? { discountCode: DISCOUNT_CODE } : {}),
      })
    }, 120)
  }, [paddleReady, profile])

  // ─── Success screen ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
        <DesktopSidebar />
        <div className="flex flex-col flex-1 items-center justify-center px-6 pb-24 md:pb-8">
          <motion.div
            className="text-center max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="text-6xl mb-6">🌿</div>
            <h1
              className="text-[30px] font-bold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}
            >
              Welcome to Pro
            </h1>
            <p className="text-[15px] mb-8 leading-relaxed" style={{ color: 'var(--tg)' }}>
              Your full Moment experience is now unlocked. Keep building momentum, one task at a time.
            </p>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full rounded-full py-4 text-[15px] font-semibold text-white"
              style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)', textDecoration: 'none' }}
            >
              <Leaf size={16} />
              Go to Dashboard
            </Link>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" onLoad={initPaddle} />

      <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
        <DesktopSidebar />

        <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8">

          {/* Header */}
          <div className="px-5 md:px-8 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} color="var(--gold)" />
              <span
                className="text-[11px] uppercase tracking-widest font-semibold"
                style={{ color: 'var(--gold)' }}
              >
                Pro
              </span>
            </div>
            <h1
              className="text-[28px] font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
            >
              Unlock your full journey
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--tg)' }}>
              {isTrialActive
                ? `Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}. Subscribe to keep everything.`
                : 'Everything you need to build lasting momentum.'}
            </p>
          </div>

          {/* Already Pro */}
          {isPro && !isTrialActive && (
            <div
              className="mx-5 md:mx-8 mt-4 rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{ background: '#EAF3DE', border: '1px solid #C0DD97' }}
            >
              <Check size={18} color="var(--gp)" />
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--gp)' }}>You're on Pro</p>
                <p className="text-[12px]" style={{ color: '#3B6D11' }}>All features are unlocked.</p>
              </div>
            </div>
          )}

          {/* EARLY50 launch badge */}
          {!isPro && (
            <div
              className="mx-5 md:mx-8 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #2D5A27 0%, #3D7A35 100%)', boxShadow: 'var(--shadow-card)' }}
            >
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  Launch offer — 50% off your first 3 months
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Code <span className="font-mono font-bold" style={{ color: 'var(--gold)' }}>EARLY50</span> auto-applies at checkout · First 50 subscribers only
                </p>
              </div>
            </div>
          )}

          {/* Pricing cards */}
          {(!isPro || isTrialActive) && !checkoutOpen && (
            <div className="mx-5 md:mx-8 mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

              {/* Monthly */}
              <motion.button
                onClick={() => openCheckout('monthly')}
                className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
                style={{
                  background: 'white',
                  border: selectedPlan === 'monthly' ? '2px solid var(--gp)' : '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-card)',
                  cursor: paddleReady ? 'pointer' : 'not-allowed',
                  opacity: paddleReady ? 1 : 0.6,
                }}
                whileTap={{ scale: 0.98 }}
                disabled={!paddleReady || paddleFailed}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tg)' }}>Monthly</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[13px] line-through" style={{ color: 'var(--tgl)' }}>$5</span>
                      <span className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>$2.50</span>
                      <span className="text-[13px]" style={{ color: 'var(--tg)' }}>/mo</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--gs)' }}>for first 3 months, then $5/mo</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'var(--gpa)', color: 'var(--gp)' }}
                  >
                    EARLY50
                  </span>
                </div>
                <div
                  className="w-full rounded-full py-2.5 text-center text-[14px] font-semibold text-white mt-2"
                  style={{ background: 'var(--gp)' }}
                >
                  {paddleFailed
                    ? 'Checkout unavailable'
                    : paddleReady
                    ? 'Subscribe Monthly'
                    : 'Loading...'}
                </div>
              </motion.button>

              {/* Annual */}
              <motion.button
                onClick={() => openCheckout('annual')}
                className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
                style={{
                  background: 'var(--deep-pine)',
                  border: '1.5px solid var(--deep-pine)',
                  boxShadow: '0 4px 24px rgba(23,58,45,0.25)',
                  cursor: paddleReady ? 'pointer' : 'not-allowed',
                  opacity: paddleReady ? 1 : 0.6,
                }}
                whileTap={{ scale: 0.98 }}
                disabled={!paddleReady || paddleFailed}
              >
                <div className="absolute top-3 right-3">
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'var(--gold)', color: 'var(--deep-pine)' }}
                  >
                    BEST VALUE
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>Annual</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.95)' }}>$40</span>
                    <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>/year</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>$3.33/month · save 33%</p>
                </div>
                <div
                  className="w-full rounded-full py-2.5 text-center text-[14px] font-semibold mt-2"
                  style={{ background: 'var(--gold)', color: 'var(--deep-pine)' }}
                >
                  {paddleReady ? 'Subscribe Annual' : 'Loading...'}
                </div>
              </motion.button>
            </div>
          )}

          {paddleFailed && (
            <p className="mx-5 md:mx-8 mt-3 text-[13px] text-center" style={{ color: '#C0392B' }}>
              Checkout couldn't load. Try refreshing, or contact{' '}
              <a href="mailto:support@moment-app.com" style={{ color: '#C0392B' }}>
                support@moment-app.com
              </a>.
            </p>
          )}

          {/* Paddle inline checkout */}
          <AnimatePresence>
            {checkoutOpen && (
              <motion.div
                className="mx-5 md:mx-8 mt-5 rounded-2xl overflow-hidden"
                style={{ background: 'white', boxShadow: 'var(--shadow-card)', border: '1.5px solid var(--border)' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Checkout header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--td)' }}>
                      Moment Pro — {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--tg)' }}>
                      {selectedPlan === 'monthly' ? '$2.50/mo for 3 months, then $5/mo' : '$40/year · cancel anytime'}
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--gpa)', border: 'none', cursor: 'pointer' }}
                    aria-label="Close checkout"
                  >
                    <X size={14} color="var(--tg)" />
                  </button>
                </div>

                {/* Loading state */}
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--gso)', borderTopColor: 'var(--gp)' }}
                    />
                  </div>
                )}

                {/* Paddle mounts here */}
                <div className="paddle-checkout-frame" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Change plan button when checkout is open */}
          {checkoutOpen && (
            <button
              onClick={() => setCheckoutOpen(false)}
              className="mx-5 md:mx-8 mt-3 text-[13px] text-center"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tg)' }}
            >
              ← Choose a different plan
            </button>
          )}

          {/* Feature comparison */}
          <div className="mx-5 md:mx-8 mt-6">
            <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--tg)' }}>
              What's included
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              {/* Column headers */}
              <div
                className="grid grid-cols-3 px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tg)' }}>Feature</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-center" style={{ color: 'var(--tg)' }}>Free</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-center" style={{ color: 'var(--gp)' }}>Pro</p>
              </div>

              {FEATURES.map((f, i) => (
                <div
                  key={f.label}
                  className="grid grid-cols-3 px-4 py-3 items-center"
                  style={{
                    borderBottom: i < FEATURES.length - 1 ? '1px solid var(--border)' : 'none',
                    background: i % 2 === 0 ? 'white' : 'var(--card)',
                  }}
                >
                  <p className="text-[13px]" style={{ color: 'var(--td)' }}>{f.label}</p>
                  <div className="flex justify-center">
                    {f.free === false ? (
                      <X size={14} color="var(--tgl)" />
                    ) : (
                      <p className="text-[12px] text-center" style={{ color: 'var(--tg)' }}>{f.free}</p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {f.pro === true ? (
                      <Check size={14} color="var(--gp)" strokeWidth={2.5} />
                    ) : (
                      <p className="text-[12px] text-center" style={{ color: 'var(--gp)' }}>{f.pro}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer reassurance */}
          <div className="mx-5 md:mx-8 mt-5 mb-4 text-center">
            <p className="text-[12px]" style={{ color: 'var(--tgl)' }}>
              Cancel anytime · No data deleted on downgrade · Payments secured by Paddle
            </p>
          </div>

        </div>
        <BottomNav />
      </div>
    </>
  )
}