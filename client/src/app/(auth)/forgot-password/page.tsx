'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setPending(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <>
      {sent ? (
        <div className="text-center py-4">
          <p className="text-4xl mb-4">📬</p>
          <h2 className="text-[20px] font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Check your email
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>
            We sent a password reset link to <strong>{email}</strong>. Check your inbox.
          </p>
          <Link href="/login" className="text-[13px] font-semibold" style={{ color: 'var(--gf)' }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-[20px] font-bold mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Reset your password
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>
            Enter your email and we'll send a reset link.
          </p>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-[13px]"
              style={{ background: '#FEF2F2', color: '#C0392B', border: '1px solid #FBDCDC' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5 tracking-wide"
                style={{ color: 'var(--tg)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'var(--ow)', color: 'var(--td)', fontFamily: 'var(--font-body)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-full py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)', fontFamily: 'var(--font-body)', cursor: pending ? 'not-allowed' : 'pointer' }}
            >
              {pending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--tg)' }}>
            <Link href="/login" className="font-semibold" style={{ color: 'var(--gf)', textDecoration: 'none' }}>
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </>
  )
}