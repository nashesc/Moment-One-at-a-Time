// BEFORE — nothing; every route did this inline, incorrectly:
// const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
// x-forwarded-for is client-controlled. Setting it to a random value
// gives an attacker a fresh rate limit bucket on every request.

// AFTER — new file
export function getClientIp(request) {
  // x-real-ip is set by Vercel's edge and is not client-writable
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // If x-real-ip is absent, take the LAST entry in x-forwarded-for.
  // Vercel appends the true client IP at the end; the first entries
  // are client-supplied and can be anything.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim())
    return ips[ips.length - 1]
  }

  return 'anonymous'
}