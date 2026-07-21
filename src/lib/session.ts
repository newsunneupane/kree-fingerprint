import 'server-only'
import { jwtVerify } from 'jose'

function getEncodedKey() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secretKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const encodedKey = getEncodedKey()
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as { userId: string; role: string; }
  } catch {
    return null
  }
}
