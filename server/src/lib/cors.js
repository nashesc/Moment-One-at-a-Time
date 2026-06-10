import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())

function getAllowOrigin(request) {
  const origin = request?.headers?.get('origin') ?? ''
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  return null  // unknown origin gets no header — browser blocks it
}

export function getCorsHeaders(request) {
  const allowOrigin = getAllowOrigin(request)
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin
  return headers
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