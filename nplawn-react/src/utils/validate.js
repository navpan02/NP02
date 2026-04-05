// Shared field validators — return an error string or '' if valid

export function validateName(v) {
  if (!v.trim()) return 'Name is required.';
  if (v.trim().length > 50) return 'Name must be 50 characters or fewer.';
  return '';
}

export function validateEmail(v) {
  if (!v.trim()) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
    return 'Enter a valid email address.';
  return '';
}

export function validatePhone(v) {
  if (!v.trim()) return '';
  const digits = v.replace(/\D/g, '');
  if (digits.length !== 10) return 'Phone number must be 10 digits.';
  return '';
}
