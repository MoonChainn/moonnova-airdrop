// src/utils/generateReferralCode.js
const crypto = require('crypto');

/**
 * Generate referral code like MOON-6CHARS (uppercase)
 * Keep it short and unique-ish.
 */
function generateReferralCode(prefix = 'MOON') {
  // 6 chars base36 from random bytes
  const random = crypto.randomBytes(4).toString('hex'); // 8 hex chars
  const code = random.slice(0, 6).toUpperCase();
  return `${prefix}${code}`;
}

module.exports = generateReferralCode;
