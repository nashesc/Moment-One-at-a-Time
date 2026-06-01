'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'

const FIELDS = [
  { name: 'fullName', label: 'Full name',  type: 'text',     placeholder: 'Maria Santos'     },
  { name: 'email',    label: 'Email',      type: 'email',    placeholder: 'you@example.com'   },
  { name: 'password', label: 'Password',   type: 'password', placeholder: '••••••••'          },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ow)' }}>
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ background: 'var(--gp)' }}>
          <Leaf size={26} color="white" strokeWidth={1.75} />
        </div>
        <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>Moment</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--tg)' }}>One at a time.</p>
      </div>

      <div className="flex-1 px-6 max-w-sm mx-auto w-full">
        <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Create your space
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>Start with one small moment.</p>

          <div className="flex flex-col gap-4">
            {FIELDS.map(f => (
              <div key={f.name}>
                <label className="block text-[12px] font-medium mb-1.5 tracking-wide" style={{ color: 'var(--tg)' }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-150"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--ow)', color: 'var(--td)', fontFamily: 'var(--font-body)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}
          </div>

          <button
            className="mt-6 w-full rounded-full py-[14px] text-[15px] font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)', fontFamily: 'var(--font-body)' }}
          >
            Create account
          </button>

          <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--tg)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--gf)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}