import { apiFetch } from "../lib/api";
import { AccountSummary } from "../types/account";

export async function getAccounts(): Promise<AccountSummary[]> {
  return apiFetch("/api/accounts");
}

export async function getAccountBalance(
  accountId: number
): Promise<number> {
  return apiFetch(`/api/accounts/${accountId}/balance`);
}