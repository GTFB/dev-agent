/**
 * AID (Atomic ID) Generator for Dev Agent
 * Generates unique, typed identifiers for different entity types
 */

import { AIDMetadata } from './types.js';

/**
 * AID Registry - maps entity types to their prefixes
 */
export const AID_REGISTRY = {
  A: 'Archive (Documents)',
  B: 'Base (Logistics, Inventory)',
  C: 'Contractor (Legal entities)',
  D: 'Deal (Sales deals)',
  E: 'Employee (Staff)',
  F: 'Finance (Transactions)',
  G: 'Goal',
  H: 'Human (Natural persons)',
  I: 'Invoice (Bills)',
  J: 'Journal (System logs)',
  K: 'Key (API keys, tokens)',
  L: 'Location (Geo points)',
  M: 'Message (Messages)',
  N: 'Notice (Notifications)',
  O: 'Outreach (Marketing)',
  P: 'Product (Products)',
  Q: 'Qualification (Assessments)',
  R: 'Routine (Automation)',
  S: 'Segment (Segments)',
  T: 'Text (Content)',
  U: 'University (LMS / Education)',
  V: 'Vote (Surveys)',
  W: 'Wallet (Wallets)',
  X: 'Xpanse (Spaces)',
  Y: 'Yard (Gamification)',
  Z: 'Zoo (Animals)'
} as const;

/**
 * Valid AID prefixes
 */
export type AIDPrefix = keyof typeof AID_REGISTRY;

/**
 * Generate a random alphanumeric string of specified length
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique AID for the specified entity type
 * Format: [prefix]-[a-z0-9]{6}
 * 
 * @param prefix - Entity type prefix (e.g., 'G' for Goals/Tasks)
 * @param metadata - Additional metadata for the entity
 * @returns Unique AID string
 */
export function generateUniqueEntityId(
  prefix: AIDPrefix,
  metadata: AIDMetadata
): string {
  // Validate prefix
  if (!AID_REGISTRY[prefix]) {
    throw new Error(`Invalid AID prefix: ${prefix}. Valid prefixes: ${Object.keys(AID_REGISTRY).join(', ')}`);
  }

  // Generate 6-character random string
  const randomPart = generateRandomString(6);
  
  // Format: prefix-randomstring (e.g., g-a1b2c3)
  return `${prefix.toLowerCase()}-${randomPart}`;
}

/**
 * Validate if a string is a valid AID
 * 
 * @param aid - String to validate
 * @returns True if valid AID format
 */
export function isValidAID(aid: string): boolean {
  const pattern = /^[a-z]-[a-z0-9]{6}$/;
  return pattern.test(aid);
}

/**
 * Extract prefix from AID
 * 
 * @param aid - AID string
 * @returns Prefix character or null if invalid
 */
export function getAIDPrefix(aid: string): AIDPrefix | null {
  if (!isValidAID(aid)) {
    return null;
  }
  return aid.charAt(0).toUpperCase() as AIDPrefix;
}

/**
 * Get entity type description from AID prefix
 * 
 * @param prefix - AID prefix
 * @returns Description of entity type
 */
export function getEntityTypeDescription(prefix: AIDPrefix): string {
  return AID_REGISTRY[prefix];
}

/**
 * Generate AID for a goal (always uses 'G' prefix)
 * 
 * @param title - Goal title
 * @returns Goal AID
 */
export function generateGoalId(title: string): string {
  return generateUniqueEntityId('G', {
    prefix: 'G',
    title,
    type: 'goal',
    status: 'todo'
  });
}

/**
 * Generate AID for a document (uses 'A' prefix)
 * 
 * @param title - Document title
 * @returns Document AID
 */
export function generateDocumentId(title: string): string {
  return generateUniqueEntityId('A', {
    prefix: 'A',
    title,
    type: 'document',
    status: 'draft'
  });
}
