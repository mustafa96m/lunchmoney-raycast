export enum Filter {
  All = "all",
  Pending = "pending",
  Cleared = "cleared",
}

export interface Transaction {
  id: number;
  date: string;
  payee: string;
  amount: number;
  to_base: number;
  currency: string;
  notes?: string;
  category_id?: number;
  status: "cleared" | "uncleared" | "recurring";
  asset_id: number;
}

export interface Category {
  id: number;
  name: string;
  is_income: boolean;
  exclude_from_budget: boolean;
  exclude_from_totals: boolean;
  updated_at: string;
  created_at: string;
  is_group: boolean;
  group_id?: number;
}

export interface RecurringTransaction {
  id: number;
  type: string;
  start_date: string;
  end_date?: string;
  amount: number;
  currency: string;
  payee?: string;
  notes?: string;
  category_id?: number;
  recurring_id?: number;
}

// Add the Preferences interface
export interface Preferences {
  LUNCH_MONEY_API_KEY: string;
  DEFAULT_CURRENCY: string;
}

export interface Asset {
  id: number;
  name: string;
  display_name: string;
  balance: number;
  balance_as_of: string;
  currency: string;
  type: string;
  subtype: string | null;
  status: 'active' | 'closed';
}
