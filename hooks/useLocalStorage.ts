import { useState, useEffect } from 'react';

/**
 * A custom hook for syncing React state with localStorage.
 *
 * This hook provides a TypeScript-generic way to persist state to localStorage
 * with automatic serialization/deserialization and error handling.
 *
 * @template T - The type of value to store
 * @param key - The localStorage key to use
 * @param initialValue - The default value if no value exists in localStorage
 *
 * @returns A tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * // Basic usage with string
 * const [name, setName] = useLocalStorage('user_name', 'Guest');
 *
 * // Usage with complex object
 * interface UserStats {
 *   coins: number;
 *   level: number;
 * }
 * const [stats, setStats] = useLocalStorage<UserStats>('stats', {
 *   coins: 0,
 *   level: 1
 * });
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use the provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  // Return a wrapped version of useState's setter function that
  // accepts both a value and a function (like useState)
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
