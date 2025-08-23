// Common types for utilities package

export interface UtilityConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
