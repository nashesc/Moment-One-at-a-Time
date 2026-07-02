import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const rateLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '60 s'), analytics: true })
const writeLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '60 s'), analytics: true })
const authRateLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '60 s'), analytics: true })

const LIMIT_TIMEOUT_MS = 400

// Fail-open on Redis timeout, not fail-hang. A slow/dead rate limiter
// should never be able to make every route in the app time out — that
// turns an availability problem into a denial-of-service on yourself.
async function limitWithTimeout(limiter: Ratelimit, key: string) {
  try {
    return await Promise.race([
      limiter.limit(key),
      new Promise<{ success: true }>((resolve) =>
        setTimeout(() => resolve({ success: true }), LIMIT_TIMEOUT_MS)
      ),
    ])
  } catch {
    return { success: true }
  }
}

export const limitStandard = (key: string) => limitWithTimeout(rateLimiter, key)
export const limitWrite    = (key: string) => limitWithTimeout(writeLimiter, key)
export const limitAuth     = (key: string) => limitWithTimeout(authRateLimiter, key)