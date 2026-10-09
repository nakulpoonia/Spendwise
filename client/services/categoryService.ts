import { apiFetch } from "../lib/api";

import type {
  CategorySummary,
  CategoryType,
} from "../types/category";

export async function getCategories(): Promise<CategorySummary[]> {
  return apiFetch("/api/categories");
}

export async function getCategoriesByType(
  type: CategoryType
): Promise<CategorySummary[]> {
  return apiFetch(`/api/categories/type/${type}`);
}

export async function createCategory(
  name: string,
  type: CategoryType
): Promise<CategorySummary> {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify({
      name,
      type,
    }),
  });
}