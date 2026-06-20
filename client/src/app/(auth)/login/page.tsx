'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/lib/supabase/actions'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <>
      <h2
        className="text-[20px] font-bold mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}
      >
        Welcome back
      </h2>
      <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>
        Sign in to your space.
      </p>

      {/* Server action error */}
      {state?.error && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-[13px]"
          style={{ background: '#FEF2F2', color: '#C0392B', border: '1px solid #FBDCDC' }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-[12px] font-medium mb-1.5 tracking-wide"
            style={{ color: 'var(--tg)' }}
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            autoComplete="email"
            defaultValue=""
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-150"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--ow)',
              color: 'var(--td)',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label
            className="block text-[12px] font-medium mb-1.5 tracking-wide"
            style={{ color: 'var(--tg)' }}
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            defaultValue=""
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-150"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--ow)',
              color: 'var(--td)',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{
            background: 'var(--gp)',
            boxShadow: 'var(--shadow-btn)',
            fontFamily: 'var(--font-body)',
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px]">
        <Link
          href="/forgot-password"
          className="font-medium"
          style={{ color: 'var(--tg)', textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
      </p>

      <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--tg)' }}>
        No account?{' '}
        <Link
          href="/register"
          className="font-semibold"
          style={{ color: 'var(--gf)', textDecoration: 'none' }}
        >
          Register
        </Link>
      </p>
    </>
  )
}