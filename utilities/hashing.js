import { isEmpty } from "./present.js";

// Gmail delivers to the same mailbox whatever dots the local part carries. Elsewhere a dot can be significant.
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

// SHA-256 round constants: the first 32 bits of the fractional parts of the cube roots of the first 64 primes.
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/**
 * @private UTF-8 bytes of a string, without TextEncoder.
 */
function utf8Bytes(value) {
  const bytes = [];
  for (const character of String(value)) {
    const code = character.codePointAt(0);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/**
 * SHA-256 of a string as 64 lowercase hex characters.
 * Written out here because Shopify's extension sandbox doesn't provide Web Crypto.
 */
export function sha256Hex(value) {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;

  // Pad with a 1 bit, zeros, then the 64-bit message length, to a multiple of 64 bytes.
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }
  for (let shift = 56; shift >= 0; shift -= 8) {
    bytes.push(shift >= 32 ? Math.floor(bitLength / 2 ** shift) & 0xff : (bitLength >>> shift) & 0xff);
  }

  const hash = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const words = new Uint32Array(64);
  const rotate = (word, bits) => (word >>> bits) | (word << (32 - bits));

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const at = offset + i * 4;
      words[i] = (bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotate(words[i - 15], 7) ^ rotate(words[i - 15], 18) ^ (words[i - 15] >>> 3);
      const s1 = rotate(words[i - 2], 17) ^ rotate(words[i - 2], 19) ^ (words[i - 2] >>> 10);
      words[i] = words[i - 16] + s0 + words[i - 7] + s1;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let i = 0; i < 64; i++) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + K[i] + words[i]) | 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    [a, b, c, d, e, f, g, h].forEach((word, i) => {
      hash[i] += word;
    });
  }

  return Array.from(hash, (word) => word.toString(16).padStart(8, "0")).join("");
}

/**
 * Trimmed and lowercased, with nothing else changed. This is the form Meta hashes, and Google too for anything but Gmail.
 */
export function basicEmail(email) {
  return String(email).trim().toLowerCase();
}

/**
 * The basic form with any +tag removed, and for Gmail the dots too, so one mailbox gives one value however it was typed.
 * For Gmail this is the form Google hashes.
 */
export function canonicalEmail(email) {
  const basic = basicEmail(email);
  const at = basic.lastIndexOf("@");
  if (at < 0) {
    return basic;
  }

  const domain = basic.slice(at + 1);
  let local = basic.slice(0, at).split("+")[0];
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replaceAll(".", "");
  }

  return `${local}@${domain}`;
}

/**
 * Hashes an email in both forms. Returns `{ canonical, basic }`, or null when there is no usable email.
 * The two are equal unless the address has a +tag or is a Gmail address with dots.
 */
export function emailHashes(email) {
  if (typeof email !== "string" || isEmpty(email) || !email.includes("@")) {
    return null;
  }

  return { canonical: sha256Hex(canonicalEmail(email)), basic: sha256Hex(basicEmail(email)) };
}
