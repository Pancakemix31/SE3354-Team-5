/**
 * Client-side password rules aligned with common auth UX: no whitespace,
 * minimum length (Firebase also enforces server-side minimums).
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_WHITESPACE_ERROR =
  'Password must not contain spaces or other blank characters.';

export const PASSWORD_LENGTH_ERROR = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;

/** True if the string contains any Unicode whitespace (space, tab, newline, etc.). */
export function passwordContainsWhitespace(password) {
  return typeof password === 'string' && /\s/u.test(password);
}
