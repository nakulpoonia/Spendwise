export interface MonthlyBudgetProgress {
  budgetId: number;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  year: number;
  month: number;
}