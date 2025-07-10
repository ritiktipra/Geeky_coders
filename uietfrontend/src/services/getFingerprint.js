// src/utils/getFingerprint.js
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getFingerprint() {
  // Initialize the agent at application startup.
  const fp = await FingerprintJS.load();
  // Get the visitor identifier when you need it.
  const result = await fp.get();
  return result.visitorId; // this is the unique device fingerprint
}
