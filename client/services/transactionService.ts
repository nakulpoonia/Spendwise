import { apiFetch } from "../lib/api";

import type {
  RecentTransactionsResponse,
  TransactionSummary,
  CreateIncomeRequest,
  CreateExpenseRequest,
  CreateTransferRequest,
} from "../types/transaction";

export async function getRecentTransactions(
  limit: number = 5
): Promise<RecentTransactionsResponse> {
  return apiFetch(
    `/api/transactions/recent?limit=${limit}`
  );
}

export async function getTransactionsByAccount(
  accountId: number
): Promise<TransactionSummary[]> {
  return apiFetch(
    `/api/transactions/account/${accountId}`
  );
}

export async function getTransactionById(
  transactionId: number
): Promise<TransactionSummary> {
  return apiFetch(
    `/api/transactions/${transactionId}`
  );
}

export async function createIncome(
  request: CreateIncomeRequest
) {
  return apiFetch("/api/transactions/income", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createExpense(
  request: CreateExpenseRequest
) {
  return apiFetch("/api/transactions/expense", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createTransfer(
  request: CreateTransferRequest
) {
  return apiFetch("/api/transactions/transfer", {
    method: "POST",
    body: JSON.stringify(request),
  });
}