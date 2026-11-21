const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter an email address";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter your password";
  if (value.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  return null;
}

export function validateName(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your name";
  if (v.length > 60) return "Name is too long";
  return null;
}
