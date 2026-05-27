import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Moment One at a Time
        </h1>
        <p className="text-gray-500 mb-8">
          Stay focused. Build momentum. One task at a time.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}