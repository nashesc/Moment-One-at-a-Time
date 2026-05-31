import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, go straight to dashboard
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-off-white)' }}>
      <div className="text-center max-w-md">
        <h1 className="font-playfair text-5xl text-nature-green mb-3">
          Moment.
        </h1>
        <p className="font-playfair text-xl text-text-gray italic mb-2">
          One at a Time
        </p>
        <p className="text-text-gray text-sm mb-10 leading-relaxed">
          You don't have to finish everything today.
          <br />Just this moment.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="bg-nature-green text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-forest-green transition-colors duration-200"
          >
            Start Your Journey
          </Link>
          <Link
            href="/login"
            className="border border-nature-green text-nature-green px-8 py-3 rounded-full text-sm font-medium hover:bg-pale-green/30 transition-colors duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}