/**
 * Format a number as Indian Rupee currency.
 * @param {number} n
 */
export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0);

/**
 * Format an ISO date string to a human-readable form.
 * @param {string} iso
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
};

/**
 * Format minutes into Xh Ym duration string.
 * @param {number} minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

/**
 * Truncate a string to maxLen characters.
 * @param {string} str
 * @param {number} maxLen
 */
export const truncate = (str, maxLen = 40) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}…` : str || '';
