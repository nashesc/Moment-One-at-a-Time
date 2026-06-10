'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [pending, setPending]     = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setPending(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setPending(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ow)' }}>
      <div className="flex flex-col items-center pt-16 pb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)' }}
        >
          <Leaf size={26} color="white" strokeWidth={1.75} />
        </div>
        <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
          Moment
        </h1>
      </div>

      <div className="flex-1 px-6 max-w-sm mx-auto w-full">
        <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-[20px] font-bold mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Set new password
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--tg)' }}>
            Choose a new password for your account.
          </p>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-[13px]"
              style={{ background: '#FEF2F2', color: '#C0392B', border: '1px solid #FBDCDC' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: 'New password',     value: password, onChange: setPassword },
              { label: 'Confirm password', value: confirm,  onChange: setConfirm  },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[12px] font-medium mb-1.5 tracking-wide"
                  style={{ color: 'var(--tg)' }}>
                  {f.label}
                </label>
                <input
                  type="password"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--ow)', color: 'var(--td)', fontFamily: 'var(--font-body)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--gs)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-full py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--gp)', boxShadow: 'var(--shadow-btn)', fontFamily: 'var(--font-body)', cursor: pending ? 'not-allowed' : 'pointer' }}
            >
              {pending ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}