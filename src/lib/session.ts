import 'server-only'
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'fingerprint-attendance-jwt-secret-2026'
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: { userId: string; role: string; expiresAt: Date }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as { userId: string; role: string; expiresAt: number }
  } catch {
    return null
  }
}
