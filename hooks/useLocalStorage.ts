
import { useState, useCallback, useEffect, useRef } from 'react';
import { get, set } from 'idb-keyval';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize with passed value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use a ref to track if we should sync to IDB. 
  // We want to skip syncing the initialValue if we are still loading.
  const shouldSync = useRef(false);

  // Load data asynchronously from IndexedDB
  useEffect(() => {
    let isActive = true;
    
    const loadData = async () => {
      try {
        let val = await get(key);

        // Migration logic: If not in IDB, check LocalStorage
        if (val === undefined) {
            const lsItem = window.localStorage.getItem(key);
            if (lsItem) {
                try {
                    val = JSON.parse(lsItem);
                    // Save to IDB for future
                    await set(key, val);
                    window.localStorage.removeItem(key);
                } catch (e) {
                    console.warn('Migration parse error', e);
                }
            }
        }

        // Update state if we found data
        if (isActive) {
            if (val !== undefined) {
                setStoredValue(val);
            }
            setIsLoaded(true);
            // After loading, allow syncing
            setTimeout(() => { shouldSync.current = true; }, 0);
        }
      } catch (err) {
        console.error(`Error loading key "${key}":`, err);
        if (isActive) {
            setIsLoaded(true);
            shouldSync.current = true;
        }
      }
    };

    loadData();

    return () => { isActive = false; };
  }, [key]);

  // Sync state changes to IndexedDB
  useEffect(() => {
    // Only save if we are loaded and allowed to sync
    if (isLoaded && shouldSync.current) {
        set(key, storedValue)
        .then(() => {
             window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }));
        })
        .catch((err) => {
             console.error(`Storage failed for key "${key}":`, err);
             window.dispatchEvent(new CustomEvent('local-storage-error', { 
                detail: { key, error: err } 
             }));
        });
    }
  }, [key, storedValue, isLoaded]);

  // Return a wrapped version of useState's setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((currentValue) => {
      // Allow function updates
      const valueToStore = value instanceof Function ? value(currentValue) : value;
      // We rely on the useEffect to sync this to IDB
      return valueToStore;
    });
  }, []);

  return [storedValue, setValue, isLoaded] as const;
}
