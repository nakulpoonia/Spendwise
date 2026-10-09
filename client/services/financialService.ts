import { apiFetch } from "../lib/api";
import { FinancialSummary } from "../types/dashboard";

export async function getMonthlySummary(
  month: string
): Promise<FinancialSummary> {
  return apiFetch(
    `/api/users/me/summary?month=${encodeURIComponent(month)}`
  );
}