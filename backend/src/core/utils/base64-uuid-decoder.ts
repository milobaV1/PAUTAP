import { Buffer } from 'buffer';

export function base64ToUuid(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padding);

  const buffer = Buffer.from(base64, 'base64');

  if (buffer.length !== 16) {
    throw new Error('Invalid UUID: expected 16 bytes');
  }

  const hex = buffer.toString('hex');

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}
