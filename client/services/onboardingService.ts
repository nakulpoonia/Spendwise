import { apiFetch } from "../lib/api";

export type OnboardingAccountType =
  | "BANK"
  | "CASH"
  | "CREDIT_CARD"
  | "OTHER"
  | "SAVINGS"
  | "WALLET";

export type OnboardingCategoryType =
  | "INCOME"
  | "EXPENSE";

export interface CreateOnboardingAccountRequest {
  name: string;
  type: OnboardingAccountType;
  openingBalance: number;
}

export interface CreateOnboardingCategoryRequest {
  name: string;
  type: OnboardingCategoryType;
}

export async function createOnboardingAccount(
  request: CreateOnboardingAccountRequest
) {
  return apiFetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createOnboardingCategory(
  request: CreateOnboardingCategoryRequest
) {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify(request),
  });
}