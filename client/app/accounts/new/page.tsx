"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Wallet,
  X,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { createOnboardingAccount } from "../../../services/onboardingService";

import type { AccountType } from "../../../types/account";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
}[] = [
  {
    value: "BANK",
    label: "Bank",
    description: "Savings or current account",
  },
  {
    value: "CASH",
    label: "Cash",
    description: "Physical cash",
  },
  {
    value: "WALLET",
    label: "Wallet",
    description: "Digital wallet",
  },
  {
    value: "SAVINGS",
    label: "Savings",
    description: "Savings account",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
    description: "Credit card account",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Any other account",
  },
];

interface AddedAccount {
  id: number;
  name: string;
  type: AccountType;
  openingBalance: number;
}

export default function NewAccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("BANK");
  const [openingBalance, setOpeningBalance] = useState("");

  const [addedAccounts, setAddedAccounts] = useState<AddedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case "BANK":
        return Landmark;
      case "CREDIT_CARD":
        return CreditCard;
      case "SAVINGS":
        return PiggyBank;
      case "WALLET":
      case "CASH":
      case "OTHER":
      default:
        return Wallet;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    return (
      ACCOUNT_TYPES.find((item) => item.value === type)?.label || type
    );
  };

  const resetForm = () => {
    setAccountName("");
    setAccountType("BANK");
    setOpeningBalance("");
    setError("");
  };

  const handleAddAccount = async () => {
    setError("");

    const trimmedName = accountName.trim();

    if (!trimmedName) {
      setError("Please enter an account name.");
      return;
    }

    if (
      openingBalance === "" ||
      Number.isNaN(Number(openingBalance)) ||
      Number(openingBalance) < 0
    ) {
      setError("Opening balance must be 0 or greater.");
      return;
    }

    try {
      setLoading(true);

      const balance = Number(openingBalance);

      await createOnboardingAccount({
        name: trimmedName,
        type: accountType,
        openingBalance: balance,
      });

      setAddedAccounts((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: trimmedName,
          type: accountType,
          openingBalance: balance,
        },
      ]);

      resetForm();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromList = (id: number) => {
    setAddedAccounts((previous) =>
      previous.filter((account) => account.id !== id)
    );
  };

  const handleDone = () => {
    router.push("/accounts");
  };

  if (authLoading) {
    return (
      <div
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <p className="text-sm text-slate-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-7 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/accounts")}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Back to accounts"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Accounts
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add Accounts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add one or more accounts to your SpendWise profile.
            </p>
          </div>
        </header>

        {/* Added Accounts */}
        {addedAccounts.length > 0 && (
          <section className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Added Accounts
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {addedAccounts.length}{" "}
                  {addedAccounts.length === 1
                    ? "account"
                    : "accounts"}{" "}
                  added in this session.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <Check size={17} strokeWidth={2.5} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {addedAccounts.map((account) => {
                const Icon = getAccountIcon(account.type);

                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {account.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {getAccountTypeLabel(account.type)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(account.openingBalance)}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFromList(account.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${account.name} from list`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Account Form */}
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Account details
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Add another account to your profile.
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Plus size={18} />
            </div>
          </div>

          {/* Account Name */}
          <div className="mt-7">
            <label
              htmlFor="account-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Account name
            </label>

            <input
              id="account-name"
              type="text"
              value={accountName}
              onChange={(event) =>
                setAccountName(event.target.value)
              }
              placeholder="e.g. HDFC Savings"
              className="h-11 w-full rounded-xl border border-[#DCEBE1] bg-white px-4 text-sm text-[#17352A] outline-none transition placeholder:text-slate-300 focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
            />
          </div>

          {/* Account Type */}
          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Account type
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ACCOUNT_TYPES.map((option) => {
                const selected = accountType === option.value;
                const Icon = getAccountIcon(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccountType(option.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-100 bg-white hover:border-emerald-100 hover:bg-emerald-50/30"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-white text-emerald-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          selected
                            ? "text-emerald-700"
                            : "text-slate-800"
                        }`}
                      >
                        {option.label}
                      </p>

                      {selected && (
                        <Check
                          size={15}
                          className="text-emerald-600"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-[11px] leading-4 text-slate-400">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opening Balance */}
          <div className="mt-6">
            <label
              htmlFor="opening-balance"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Opening balance
            </label>

            <input
              id="opening-balance"
              type="number"
              min="0"
              step="0.01"
              value={openingBalance}
              onChange={(event) =>
                setOpeningBalance(event.target.value)
              }
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-[#DCEBE1] bg-white px-4 text-sm text-[#17352A] outline-none transition placeholder:text-slate-300 focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
            />

            <p className="mt-2 text-xs text-slate-400">
              The starting balance of this account.
            </p>
          </div>

          {/* Preview */}
          {openingBalance !== "" &&
            !Number.isNaN(Number(openingBalance)) && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  Account preview
                </p>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = getAccountIcon(accountType);

                      return (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <Icon size={18} />
                        </div>
                      );
                    })()}

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {accountName.trim() || "New Account"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {getAccountTypeLabel(accountType)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(Number(openingBalance))}
                  </p>
                </div>
              </div>
            )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/accounts")}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddAccount}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />

              {loading ? "Adding account..." : "Add Account"}
            </button>

            {addedAccounts.length > 0 && (
              <button
                type="button"
                onClick={handleDone}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={17} strokeWidth={2.5} />
                Done
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}