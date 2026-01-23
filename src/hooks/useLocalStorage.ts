'use client';

import React from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T | undefined,
): [T | undefined, (value: T | undefined) => void, boolean] => {
  const [storedValue, setStoredValue] = React.useState<T | undefined>(initialValue);
  const [inited, setInited] = React.useState(false);

  React.useEffect(() => {
    // Retrieve from localStorage
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
    setInited(true);
  }, [key]);

  const setValue = (value: T | undefined) => {
    // Save state
    setStoredValue(value);
    // Save to localStorage
    if (value == undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [storedValue, setValue, inited];
};
