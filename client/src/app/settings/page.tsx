'use client'

import { useState } from 'react'
import { Check, X, Pencil, Bell, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import Toggle from '@/components/ui/Toggle'
import { logout } from '@/lib/supabase/actions'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { usePlan } from '@/context/PlanContext'
import { useMusic } from '@/context/MusicContext'

function EditableField({
  label,
  value,
  type = 'text',
  onSave,
  hint,
}: {
  label: string
  value: string
  type?: string
  onSave: (v: string) => Promise<string | undefined>
  hint?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEdit() {
    setDraft(value)
    setError('')
    setEditing(true)
  }

  async function handleSave() {
    if (draft.trim() === value) { setEditing(false); return }
    setSaving(true)
    setError('')
    const err = await onSave(draft.trim())
    setSaving(false)
    if (err) {
      setError(err)
    } else {
      setEditing(false)
    }
  }

  function handleCancel() {
    setDraft(value)
    setError('')
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between px-5 py-4" 
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--tg)' }}>{label}</p>
        {editing ? (
          <div>
            <input
              type={type}
              value={draft}
              onChange={e => { setDraft(e.target.value); setError('') }}
              autoFocus
              className="w-full rounded-xl px-3 py-2 text-[14px] outline-none"
              style={{
                border: error ? '1.5px solid #C0392B' : '1.5px solid var(--gs)',
                background: 'var(--ow)',
                color: 'var(--td)',
                fontFamily: 'var(--font-body)',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            {error && <p className="text-[11px] mt-1" style={{ color: '#C0392B' }}>{error}</p>}
            {hint && !error && <p className="text-[11px] mt-1" style={{ color: 'var(--tgl)' }}>{hint}</p>}
          </div>
        ) : (
          <p className="text-[14px]" style={{ color: 'var(--td)' }}>{value || '—'}</p>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gpa)', border: 'none', cursor: 'pointer' }}
          >
            <X size={14} color="var(--tg)" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: saving ? 'var(--gso)' : 'var(--gp)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving
              ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              : <Check size={14} color="white" />
            }
          </button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="ml-3 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'var(--gpa)', border: 'none', cursor: 'pointer' }}
          aria-label={`Edit ${label}`}
        >
          <Pencil size={13} color="var(--gp)" />
        </button>
      )}
    </div>
  )
}

// Time picker row
function TimePickerRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    onChange(draft)
    setOpen(false)
  }

  const displayTime = (() => {
    const [h, m] = value.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  })()

  return (
    <div>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: open ? 'none' : '1px solid var(--border)' }}
      >
        <span className="flex items-center gap-2 text-[14px]" style={{ color: 'var(--td)' }}>
          <Clock size={15} color="var(--tg)" />
          Reminder time
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: open ? 'var(--gpa)' : 'transparent',
            color: open ? 'var(--gp)' : 'var(--tg)',
            border: `1px solid ${open ? 'var(--gs)' : 'var(--border)'}`,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {displayTime}
          <Pencil size={11} />
        </button>
      </div>

      {open && (
        <div className="px-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <input
            type="time"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="rounded-xl px-3 py-2 text-[14px] outline-none flex-1"
            style={{
              border: '1.5px solid var(--gs)',
              background: 'var(--ow)',
              color: 'var(--td)',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-[13px] font-medium text-white"
            style={{ background: 'var(--gp)', border: 'none', cursor: 'pointer' }}
          >
            Save
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-2 rounded-full text-[13px]"
            style={{ background: 'var(--gpa)', color: 'var(--gp)', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { prefs, setPref, requestPushPermission, pushSupported } = useSettings()
  const { profile, updateProfile } = useAuth()
  const { plan, isPro, isTrialActive, trialDaysLeft, currentPeriodEnd } = usePlan()
  const [pushLoading, setPushLoading] = useState(false)
  const [pushMessage, setPushMessage] = useState('')
  const [pushSuccess, setPushSuccess] = useState(false)
  const { currentTrack } = useMusic()

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      setPushLoading(true)
      setPushMessage('')
      setPushSuccess(false)
      try {
        const granted = await requestPushPermission()
        if (granted) {
          setPushSuccess(true)
        } else {
          setPushMessage('Could not enable notifications. Check your browser settings.')
        }
      } catch {
        setPushMessage('Something went wrong. Please try again.')
      } finally {
        setPushLoading(false)
      }
    } else {
      setPref('pushNotifications', false)
      setPushSuccess(false)
      setPushMessage('')
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-w-0 px-5 md:px-8"
        style={{ paddingBottom: currentTrack ? 200 : 96 }}>

        <div className="pt-6 pb-4">
          <h1 className="text-[26px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Settings
          </h1>
        </div>

        <div className="flex flex-col gap-4">

          {/* Account — inline editable */}
          <div>
            <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>Account</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <EditableField
                label="Name"
                value={profile?.full_name ?? ''}
                onSave={async (v) => {
                  const res = await updateProfile({ full_name: v })
                  return res.error
                }}
              />
              <EditableField
                label="Email"
                value={profile?.email ?? ''}
                type="email"
                hint="A confirmation email may be sent to verify your new address."
                onSave={async (v) => {
                  const res = await updateProfile({ email: v })
                  return res.error
                }}
              />
              {/* Last row — no bottom border */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[14px]" style={{ color: 'var(--tg)' }}>Member since</span>
                <span className="text-[13px]" style={{ color: 'var(--tgl)' }}>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Display */}
          <div>
            <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>Display</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="text-[14px]" style={{ color: 'var(--td)' }}>Show opening quote</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg)' }}>Inspirational quote when app opens</p>
                </div>
                <Toggle
                  defaultOn={prefs.showOpeningQuote}
                  onChange={(v) => setPref('showOpeningQuote', v)}
                />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[14px]" style={{ color: 'var(--td)' }}>One task at a time</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--tg)' }}>Focus on a single moment on the dashboard</p>
                </div>
                <Toggle
                  defaultOn={prefs.oneTaskAtATime}
                  onChange={(v) => setPref('oneTaskAtATime', v)}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>Notifications</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <Bell size={14} color="var(--tg)" />
                    <p className="text-[14px]" style={{ color: 'var(--td)' }}>Push notifications</p>
                  </div>
                  <p className="text-[11px] mt-0.5 ml-[22px]" style={{ color: 'var(--tg)' }}>
                    {pushSupported ? 'Get gentle reminders to check in' : 'Not supported on this device'}
                  </p>
                  {pushMessage && (
                    <p className="text-[11px] mt-1 ml-[22px]" style={{ color: '#C0392B' }}>{pushMessage}</p>
                  )}
                  {pushSuccess && (
                    <p className="text-[11px] mt-1 ml-[22px]" style={{ color: 'var(--gp)' }}>Notifications enabled.</p>
                  )}
                </div>
                <div className="shrink-0">
                  {pushLoading ? (
                    <div className="w-11 h-6 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--gso)', borderTopColor: 'var(--gp)' }} />
                    </div>
                  ) : (
                    <Toggle
                      defaultOn={prefs.pushNotifications}
                      onChange={handlePushToggle}
                    />
                  )}
                </div>
              </div>

              <TimePickerRow
                value={prefs.reminderTime}
                onChange={(v) => setPref('reminderTime', v)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div>
            <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>Appearance</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[14px]" style={{ color: 'var(--td)' }}>Theme</span>
                <span className="text-[13px]" style={{ color: 'var(--tg)' }}>Light</span>
              </div>
            </div>
          </div>

          {/* Plan — always visible */}
          <div>
            <p className="text-[11px] uppercase tracking-widest pb-2 pl-1" style={{ color: 'var(--tg)' }}>Plan</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}>

              {/* Current plan row */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: plan !== 'pro' || isTrialActive ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium" style={{ color: 'var(--td)' }}>
                    {isTrialActive ? 'Pro Trial' : plan === 'pro' ? 'Pro' : 'Free'}
                  </p>
                  {isTrialActive && (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: trialDaysLeft <= 3 ? '#FAEEDA' : 'var(--gpa)',
                        color: trialDaysLeft <= 3 ? '#854F0B' : 'var(--gp)',
                      }}
                    >
                      {trialDaysLeft}d left
                    </span>
                  )}
                  {plan === 'pro' && !isTrialActive && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, var(--gold) 0%, #C4A040 100%)',
                        color: 'var(--deep-pine)',
                      }}
                    >
                      Pro
                    </span>
                  )}
                </div>
                {plan === 'pro' && !isTrialActive && currentPeriodEnd && (
                  <p className="text-[12px]" style={{ color: 'var(--tg)' }}>
                    Renews {new Date(currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Upgrade CTA — shown when not on paid Pro */}
              {(plan !== 'pro' || isTrialActive) && (
                <div className="px-5 py-4">
                  <p className="text-[12px] mb-3" style={{ color: 'var(--tg)' }}>
                    {isTrialActive
                      ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}. Lock in Pro before it expires.`
                      : 'Unlock unlimited tasks, full history, 100+ music tracks, and more.'}
                  </p>
                  <Link
                    href="/upgrade"
                    className="flex items-center justify-center gap-2 w-full rounded-full py-3 text-[14px] font-semibold text-white"
                    style={{
                      background: 'var(--gp)',
                      boxShadow: 'var(--shadow-btn)',
                      textDecoration: 'none',
                    }}
                  >
                    <Sparkles size={14} />
                    Upgrade to Pro
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sign out */}
          <form action={logout} onSubmit={() => {
            import('@/lib/api').then(({ clearApiCache, setCurrentUser }) => {
              clearApiCache()
              setCurrentUser(null)
            })
          }}>
            <button
              type="submit"
              className="w-full rounded-full py-[14px] text-[14px] font-medium transition-opacity hover:opacity-80"
              style={{
                background: 'white',
                border: '1.5px solid #FBDCDC',
                color: '#C0392B',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Sign out
            </button>
          </form>

        </div>
      </div>
      <BottomNav />
    </div>
  )
}