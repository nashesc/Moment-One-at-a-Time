'use client'

import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ background: 'var(--ow)' }}>
          <p className="text-4xl mb-4">🌿</p>
          <h2 className="text-[20px] font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Something went wrong
          </h2>
          <p className="text-[13px] mb-6 text-center" style={{ color: 'var(--tg)' }}>
            Try refreshing the page. If the problem persists, sign out and back in.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full px-6 py-3 text-[14px] font-semibold text-white"
            style={{ background: 'var(--gp)', border: 'none', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}