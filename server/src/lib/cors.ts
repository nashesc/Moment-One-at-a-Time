import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())

function getAllowOrigin(request: NextRequest | null): string | null {
  const origin = request?.headers?.get('origin') ?? ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : null
}

export function getCorsHeaders(request: NextRequest | null): Record<string, string> {
  const allowOrigin = getAllowOrigin(request)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin
  return headers
}

export function optionsResponse(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) })
}

export function json<T>(data: T, init: ResponseInit = {}, request: NextRequest | null = null) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...getCorsHeaders(request), ...((init.headers as Record<string, string>) ?? {}) },
  })
}