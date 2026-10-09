import { apiFetch } from "../lib/api";
import { MonthlyBudgetProgress } from "../types/budget";

export async function getMonthlyBudgetProgress(
  year: number,
  month: number
): Promise<MonthlyBudgetProgress> {
  return apiFetch(
    `/api/monthly-budgets/progress?year=${year}&month=${month}`
  );
}