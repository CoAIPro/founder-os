const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const LIMIT = 5 // max requests
const WINDOW = 60 * 1000 // per 60 seconds

export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.timestamp > WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true // allowed
  }

  if (entry.count >= LIMIT) {
    return false // blocked
  }

  entry.count++
  return true // allowed
}