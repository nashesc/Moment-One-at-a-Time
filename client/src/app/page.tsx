import { redirect } from 'next/navigation'

export default function RootPage() {
  // Middleware handles auth; if logged in go to splash, else to login
  redirect('/splash')
}