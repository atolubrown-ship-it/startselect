const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Every message here has a built-in default, used when the admin-edited
 * text (BivoBrand) isn't passed in — callers in tests or other contexts can
 * still call these with no second argument.
 */
export function validateEmail(value: string, messages?: { required?: string; invalid?: string }): string | null {
  const v = value.trim();
  if (!v) return messages?.required || "Enter an email address";
  if (!EMAIL_RE.test(v)) return messages?.invalid || "Enter a valid email address";
  return null;
}

export function validatePassword(value: string, messages?: { required?: string; tooShortTemplate?: string }): string | null {
  if (!value) return messages?.required || "Enter your password";
  if (value.length < PASSWORD_MIN_LENGTH) {
    const template = messages?.tooShortTemplate || `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    return template.replace(/\{min\}/g, String(PASSWORD_MIN_LENGTH));
  }
  return null;
}

export function validateName(value: string, messages?: { required?: string }): string | null {
  const v = value.trim();
  if (!v) return messages?.required || "Enter your name";
  if (v.length > 60) return "Name is too long";
  return null;
}
