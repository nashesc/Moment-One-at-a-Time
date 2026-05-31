'use client'

import Link from 'next/link'

export default function RegisterPage() {
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
          Create your space
        </h1>
        <p className="text-[13px] text-[(--text-gray)] mb-5">Start with one small moment.</p>

        {['Full name', 'Email', 'Password'].map((label, i) => (
          <div key={label} className="mb-4">
            <label className="block text-[12px] font-medium text-[(--text-gray)] tracking-wide mb-1">{label}</label>
            <input
              type={i === 2 ? 'password' : i === 1 ? 'email' : 'text'}
              placeholder={i === 0 ? 'Maria Santos' : i === 1 ? 'you@example.com' : '••••••••'}
              className="w-full rounded-[10px] border-[1.5px] border-[#ddd] bg-white px-3 py-[10px] text-[14px] text-[(--text-dark)] outline-none focus:border-[(--green-sage)]"
            />
          </div>
        ))}

        <button className="mt-1 w-full rounded-full bg-[(--green-primary)] py-[13px] text-[15px] font-medium text-white transition-colors hover:bg-[(--green-forest)]">
          Create account
        </button>

        <p className="mt-4 text-center text-[13px] text-[(--text-gray)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[(--green-forest)]">Sign in</Link>
        </p>
      </div>
    </div>
  )
}