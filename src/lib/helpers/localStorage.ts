export function clearLocalStorage({ except }: { except?: string[] } = {}) {
  if (!except) {
    localStorage.clear();
  } else {
    if (typeof localStorage !== 'undefined') {
      const allKeys = Object.keys(localStorage).filter((key) => !except.includes(key));
      for (const key of allKeys) {
        localStorage.removeItem(key);
      }
    }
  }
}
