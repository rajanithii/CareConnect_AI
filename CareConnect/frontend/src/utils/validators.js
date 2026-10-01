export const validators = {
  required: (value) => (value && String(value).trim().length > 0) || 'This field is required',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
  phone: (value) => /^[+]?[\d\s-]{10,15}$/.test(value) || 'Enter a valid phone number',
  minLength: (min) => (value) =>
    (value && value.length >= min) || `Must be at least ${min} characters`,
  matches: (compareValue, label = 'Fields') => (value) =>
    value === compareValue || `${label} do not match`,
};
