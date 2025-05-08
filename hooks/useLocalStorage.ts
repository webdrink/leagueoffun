import { useState, useEffect } from 'react';
import { getStorageValue, setStorageValue } from './utils/storageUtils';

/**
 * Custom hook for handling values in localStorage with type safety
 * @param key The localStorage key to use
 * @param initialValue Default value if key doesn't exist in localStorage
 * @returns A stateful value and function to update it (similar to useState)
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => getStorageValue<T>(key, initialValue));

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      setStorageValue(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Read local storage value on mount
  useEffect(() => {
    setStoredValue(getStorageValue(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage;
