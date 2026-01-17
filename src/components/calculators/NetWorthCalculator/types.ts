/**
 * Net Worth Calculator Types
 */

export interface Asset {
  id: string;
  name: string;
  value: number;
  category: AssetCategory;
}

export interface Liability {
  id: string;
  name: string;
  value: number;
  category: LiabilityCategory;
}

export type AssetCategory =
  | 'cash'
  | 'investments'
  | 'retirement'
  | 'property'
  | 'vehicles'
  | 'other';
export type LiabilityCategory = 'mortgage' | 'auto' | 'student' | 'credit' | 'other';

export interface NetWorthInputs {
  assets: Asset[];
  liabilities: Liability[];
}

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: Record<AssetCategory, number>;
  liabilityBreakdown: Record<LiabilityCategory, number>;
  debtToAssetRatio: number;
}

export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'cash', label: 'Cash & Savings' },
  { value: 'investments', label: 'Investments' },
  { value: 'retirement', label: 'Retirement Accounts' },
  { value: 'property', label: 'Real Estate' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other Assets' },
];

export const LIABILITY_CATEGORIES: { value: LiabilityCategory; label: string }[] = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loans' },
  { value: 'student', label: 'Student Loans' },
  { value: 'credit', label: 'Credit Cards' },
  { value: 'other', label: 'Other Debts' },
];

export const DEFAULT_ASSETS: Asset[] = [
  { id: '1', name: 'Checking Account', value: 5000, category: 'cash' },
  { id: '2', name: 'Savings Account', value: 10000, category: 'cash' },
  { id: '3', name: '401(k)', value: 50000, category: 'retirement' },
  { id: '4', name: 'Home Value', value: 300000, category: 'property' },
  { id: '5', name: 'Car Value', value: 15000, category: 'vehicles' },
];

export const DEFAULT_LIABILITIES: Liability[] = [
  { id: '1', name: 'Mortgage Balance', value: 200000, category: 'mortgage' },
  { id: '2', name: 'Auto Loan', value: 10000, category: 'auto' },
  { id: '3', name: 'Credit Cards', value: 3000, category: 'credit' },
];

export function getDefaultInputs(): NetWorthInputs {
  return {
    assets: DEFAULT_ASSETS,
    liabilities: DEFAULT_LIABILITIES,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
