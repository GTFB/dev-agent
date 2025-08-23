// Common React hooks for the utils package

export function useLocalStorage<T>(key: string, initialValue: T) {
  // This is a placeholder - actual implementation would use React hooks
  return [initialValue, (value: T) => {}] as const;
}

export function useDebounce<T>(value: T, delay: number): T {
  // This is a placeholder - actual implementation would use React hooks
  return value;
}
