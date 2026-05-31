'use client'

import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[(--off-white)]">
      <div className="pt-10 pb-5 text-center">
        <p className="text-[26px] text-[(--green-primary)]" style={{ fontFamily: '(--font-display)', fontWeight: 600 }}>
          🌿 Moment
        </p>
        <p className="text-[13px] text-[(--text-gray)] mt-1">One at a time.</p>
      </div>

      <div className="flex-1 px-7 pb-8">
        <h1 className="text-[20px] text-[(--text-dark)] mb-1" style={{ fontFamily: '(--font-display)' }}>
          Welcome back
        </h1>
        <p className="text-[13px] text-[(--text-gray)] mb-5">Sign in to your space.</p>

        <div className="mb-4">
          <label className="block text-[12px] font-medium text-[(--text-gray)] tracking-wide mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-[10px] border-[1.5px] border-[#ddd] bg-white px-3 py-[10px] text-[14px] text-[(--text-dark)] outline-none focus:border-[(--green-sage)]"
          />
        </div>
        <div className="mb-5">
          <label className="block text-[12px] font-medium text-[(--text-gray)] tracking-wide mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-[10px] border-[1.5px] border-[#ddd] bg-white px-3 py-[10px] text-[14px] text-[(--text-dark)] outline-none focus:border-[(--green-sage)]"
          />
        </div>

        <button className="w-full rounded-full bg-[(--green-primary)] py-[13px] text-[15px] font-medium text-white transition-colors hover:bg-[(--green-forest)]">
          Sign in
        </button>

        <p className="mt-4 text-center text-[13px] text-[(--text-gray)]">
          No account?{' '}
          <Link href="/register" className="font-medium text-[(--green-forest)]">Register</Link>
        </p>
      </div>
    </div>
  )
}