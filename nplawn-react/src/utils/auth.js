import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Auth helpers — all password hashing is handled server-side by Supabase
// (bcrypt with per-user salt). No plaintext or local hashes are stored.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Legacy / local-auth helpers (kept for backward-compat and test coverage)
// ---------------------------------------------------------------------------

/** SHA-256 of a string → 64-char lowercase hex. */
export async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Seed accounts that cannot be re-registered. */
export const RESERVED_EMAILS = ['admin@admin.com', 'navpan@gmail.com'];

export function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('nplawn_users') || '[]'); }
  catch { return []; }
}

export function saveRegisteredUsers(users) {
  localStorage.setItem('nplawn_users', JSON.stringify(users));
}

/** Look up a user by email + password in localStorage. */
export async function findUser(email, password) {
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found) return null;
  if (!found.verified) return { error: 'unverified' };
  const hash = await sha256(password);
  if (hash !== found.hash) return null;
  return { email: found.email, name: found.name || '', role: found.role || 'user' };
}

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem('nplawn_session')); }
  catch { return null; }
}

export function saveSession(user) {
  sessionStorage.setItem('nplawn_session', JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem('nplawn_session');
}

// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * role: 'user' | 'provider' | 'admin'
 * Supabase will send a confirmation email with a 6-digit OTP when email
 * confirmation is enabled in the Supabase dashboard (recommended).
 */
export async function signUpUser({ email, password, name, role = 'user' }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: { name: name || email.split('@')[0], role },
    },
  });
  return { data, error };
}

/**
 * Verify the 6-digit OTP sent to the user's email after signUp.
 */
export async function verifyEmailOtp({ email, token }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token,
    type: 'email',
  });
  return { data, error };
}

/**
 * Resend the signup confirmation OTP.
 */
export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.toLowerCase().trim(),
  });
  return { error };
}

/**
 * Sign in with Google OAuth.
 * Supabase redirects back to the app; session is picked up by onAuthStateChange.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/' },
  });
  return { data, error };
}

/**
 * Sign in with Facebook OAuth.
 */
export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: window.location.origin + '/' },
  });
  return { data, error };
}

/**
 * Sign in with email + password.
 * Returns { data: { session, user }, error }.
 */
export async function signInUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  return { data, error };
}

/**
 * Map a Supabase auth error code to a user-friendly message.
 */
export function authErrorMessage(error) {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Invalid email or password.';
  if (msg.includes('email not confirmed'))
    return 'Please verify your email before signing in.';
  if (msg.includes('user already registered'))
    return 'An account with this email already exists.';
  if (msg.includes('password should be'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  return error.message || 'Something went wrong. Please try again.';
}

/**
 * Extract a normalised user object from a Supabase Session.
 */
export function sessionToUser(session) {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id:    user.id,
    email: user.email,
    // app_metadata is server-only (set via Supabase admin/service key) — authoritative.
    // user_metadata is set during signUp by the client; check it only as fallback.
    role:  user.app_metadata?.role ?? user.user_metadata?.role ?? 'user',
    name:  user.user_metadata?.name  ?? user.email?.split('@')[0] ?? '',
  };
}

// ---------------------------------------------------------------------------
// Retained for backward-compatibility while orders still read localStorage
// ---------------------------------------------------------------------------
export function getOrders() {
  try { return JSON.parse(localStorage.getItem('nplawn_orders') || '[]'); }
  catch { return []; }
}
