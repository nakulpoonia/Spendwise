export type CategoryType = "INCOME" | "EXPENSE";

export interface CategorySummary {
  id: number;
  name: string;
  type: CategoryType;
}