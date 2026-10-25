/**
 * Turnstile site key for the contact form (widget "jovantomovic.com contact form").
 * It is public, so it lives in the repo; the matching secret is the Worker secret TURNSTILE_SECRET.
 * For local testing with `npm run preview`, .dev.vars uses Turnstile's always-pass test secret,
 * which only accepts tokens from the test site key `1x00000000000000000000AA`.
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFlSTS2WWPlAOFK0';
