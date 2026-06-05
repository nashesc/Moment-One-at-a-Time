import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())

function getAllowOrigin(request) {
  const origin = request?.headers?.get('origin') ?? ''
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  return ALLOWED_ORIGINS[0]  // fallback to first (primary) origin
}


export function getCorsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': getAllowOrigin(request),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function optionsResponse(request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) })
}

export function json(data, init = {}, request = null) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...getCorsHeaders(request), ...(init.headers ?? {}) },
  })
}