import { redirect } from 'next/navigation'

export default function RootPage() {
  // Later: check Supabase session server-side here
  // const session = await getSession()
  // if (session) redirect('/dashboard')
  redirect('/login')
}