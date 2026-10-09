export type TransactionType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER";

export type TransactionDirection =
  | "IN"
  | "OUT";

export interface TransactionSummary {
  id: number;
  amount: number;
  type: TransactionType;
  direction: TransactionDirection;
  description: string | null;
  transactionDate: string;
}

export interface RecentTransactionsResponse {
  content: TransactionSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateIncomeRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  transactionDate: string;
}

export interface CreateExpenseRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  description: string | null;
  transactionDate: string;
}

export interface CreateTransferRequest {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  description: string | null;
  transactionDate: string;
}