import { apiFetch } from "../lib/api";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

export interface MonthlyBudgetProgress {
  id: number;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  year: number;
  month: number;
}

export interface MonthlyBudgetSummary {
  id: number;
  budgetAmount: number;
  year: number;
  month: number;
}

export interface CategoryBudgetSummary {
  id: number;
  categoryName: string;
  budgetAmount: number;
  year: number;
  month: number;
}

export interface CategoryBudgetProgress {
  id: number;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  type: "EXPENSE" | "INCOME";
}

/* -------------------------------------------------------
   MONTHLY BUDGET
------------------------------------------------------- */

export async function createMonthlyBudget(request: {
  budgetAmount: number;
  year: number;
  month: number;
}) {
  return apiFetch("/api/monthly-budgets", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getMonthlyBudget(
  year: number,
  month: number
): Promise<MonthlyBudgetSummary> {
  return apiFetch(
    `/api/monthly-budgets?year=${year}&month=${month}`
  );
}

export async function getMonthlyBudgetProgress(
  year: number,
  month: number
): Promise<MonthlyBudgetProgress> {
  return apiFetch(
    `/api/monthly-budgets/progress?year=${year}&month=${month}`
  );
}

/* -------------------------------------------------------
   CATEGORY BUDGET
------------------------------------------------------- */

export async function createCategoryBudget(request: {
  categoryId: number;
  budgetAmount: number;
  year: number;
  month: number;
}) {
  return apiFetch("/api/budgets", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getCategoryBudgets(): Promise<
  CategoryBudgetSummary[]
> {
  return apiFetch("/api/budgets");
}

export async function getCategoryBudgetProgress(
  budgetId: number
): Promise<CategoryBudgetProgress> {
  return apiFetch(
    `/api/budgets/${budgetId}/progress`
  );
}

/* -------------------------------------------------------
   CATEGORIES
------------------------------------------------------- */

export async function getExpenseCategories(): Promise<
  ExpenseCategory[]
> {
  return apiFetch("/api/categories/type/EXPENSE");
}