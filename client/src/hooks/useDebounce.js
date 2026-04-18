import { useState, useEffect } from 'react';

/**
 * Debounce a value with a specified delay.
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
