export type AccountType =
  | "BANK"
  | "CASH"
  | "CREDIT_CARD"
  | "WALLET"
  | "SAVINGS"
  | "OTHER";

export interface AccountSummary {
  id: number;
  name: string;
  type: AccountType;
  openingBalance: number;
}