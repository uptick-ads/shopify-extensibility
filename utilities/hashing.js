import { isEmpty } from "./present.js";

// Gmail delivers to the same mailbox whatever dots the local part carries. Elsewhere a dot can be significant.
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/**
 * SHA-256 of a string as 64 lowercase hex characters. Resolves to null where the runtime has no Web Crypto.
 */
export async function sha256Hex(value) {
  const subtle = globalThis.crypto?.subtle;
  if (typeof subtle?.digest !== "function" || typeof TextEncoder === "undefined") {
    return null;
  }

  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
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
 * Hashes an email in both forms. Resolves to `{ canonical, basic }`, or null when there is no usable email or it can't be hashed.
 * The two are equal unless the address has a +tag or is a Gmail address with dots.
 */
export async function emailHashes(email) {
  if (typeof email !== "string" || isEmpty(email) || !email.includes("@")) {
    return null;
  }

  const [canonical, basic] = await Promise.all([
    sha256Hex(canonicalEmail(email)),
    sha256Hex(basicEmail(email)),
  ]);
  if (canonical == null || basic == null) {
    return null;
  }

  return { canonical, basic };
}
