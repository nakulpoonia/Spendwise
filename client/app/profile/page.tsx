"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import AppNavbar from "../../components/AppNavbar";
import { useAuth } from "../../hooks/useAuth";

import {
  getAccounts,
  getAccountBalance,
} from "../../services/accountService";

import {
  createCategory,
  getCategories,
} from "../../services/categoryService";

import type {
  AccountSummary,
  AccountType,
} from "../../types/account";

import type {
  CategorySummary,
  CategoryType,
} from "../../types/category";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function ProfilePage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [accounts, setAccounts] = useState<
    (AccountSummary & { balance: number })[]
  >([]);

  const [categories, setCategories] = useState<
    CategorySummary[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] =
    useState("");

  const [newExpenseCategory, setNewExpenseCategory] =
    useState("");

  const [newIncomeCategory, setNewIncomeCategory] =
    useState("");

  const [addingCategoryType, setAddingCategoryType] =
    useState<CategoryType | null>(null);

  /* -------------------------------------------------------
     CURRENCY
  ------------------------------------------------------- */

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    });
  }, [user?.currency]);

  const formatCurrency = (value: number) => {
    return currencyFormatter.format(value);
  };

  /* -------------------------------------------------------
     ACCOUNT ICON
  ------------------------------------------------------- */

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
        return Wallet;

      default:
        return Wallet;
    }
  };

  /* -------------------------------------------------------
     ACCOUNT TYPE
  ------------------------------------------------------- */

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case "BANK":
        return "Bank Account";

      case "CREDIT_CARD":
        return "Credit Card";

      case "SAVINGS":
        return "Savings";

      case "WALLET":
        return "Wallet";

      case "CASH":
        return "Cash";

      default:
        return type;
    }
  };

  /* -------------------------------------------------------
     AUTH REDIRECT
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      !authLoading &&
      !isAuthenticated
    ) {
      router.replace("/login");
    }
  }, [
    authLoading,
    isAuthenticated,
    router,
  ]);

  /* -------------------------------------------------------
     LOAD ACCOUNTS
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated
    ) {
      return;
    }

    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const accountData =
          await getAccounts();

        const accountsWithBalances =
          await Promise.all(
            accountData.map(
              async (account) => {
                try {
                  const balance =
                    await getAccountBalance(
                      account.id
                    );

                  return {
                    ...account,
                    balance,
                  };
                } catch {
                  return {
                    ...account,
                    balance: 0,
                  };
                }
              }
            )
          );

        setAccounts(accountsWithBalances);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [
    authLoading,
    isAuthenticated,
  ]);

  /* -------------------------------------------------------
     LOAD CATEGORIES
  ------------------------------------------------------- */

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError("");

      const data = await getCategories();

      setCategories(data);
    } catch (err) {
      console.error(err);

      setCategoryError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated
    ) {
      return;
    }

    loadCategories();
  }, [
    authLoading,
    isAuthenticated,
  ]);

  /* -------------------------------------------------------
     ADD CATEGORY
  ------------------------------------------------------- */

  const handleAddCategory = async (
    type: CategoryType
  ) => {
    const rawName =
      type === "EXPENSE"
        ? newExpenseCategory
        : newIncomeCategory;

    const name = rawName.trim();

    if (!name) {
      setCategoryError(
        `Please enter an ${
          type === "EXPENSE"
            ? "expense"
            : "income"
        } category name.`
      );

      return;
    }

    try {
      setAddingCategoryType(type);
      setCategoryError("");

      await createCategory(
        name,
        type
      );

      if (type === "EXPENSE") {
        setNewExpenseCategory("");
      } else {
        setNewIncomeCategory("");
      }

      await loadCategories();
    } catch (err) {
      console.error(err);

      setCategoryError(
        err instanceof Error
          ? err.message
          : "Unable to add category."
      );
    } finally {
      setAddingCategoryType(null);
    }
  };

  /* -------------------------------------------------------
     CATEGORY GROUPS
  ------------------------------------------------------- */

  const expenseCategories =
    categories.filter(
      (category) =>
        category.type === "EXPENSE"
    );

  const incomeCategories =
    categories.filter(
      (category) =>
        category.type === "INCOME"
    );

  /* -------------------------------------------------------
     TOTAL BALANCE
  ------------------------------------------------------- */

  const totalBalance = accounts.reduce(
    (total, account) =>
      total + account.balance,
    0
  );

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (
    authLoading ||
    !isAuthenticated
  ) {
    return (
      <div
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* NAVBAR */}

        <AppNavbar activePage="profile" />

        {/* HEADER */}

        <header className="mt-7 mb-7 flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-sm font-medium text-slate-500">
              SpendWise
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your personal information and preferences.
            </p>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* PERSONAL INFORMATION */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your SpendWise account information.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProfileInfoCard
              label="Name"
              value={user?.name || "—"}
            />

            <ProfileInfoCard
              label="Email"
              value={user?.email || "—"}
            />

            <ProfileInfoCard
              label="Currency"
              value={user?.currency || "INR"}
            />
          </div>
        </section>

        {/* FINANCE OVERVIEW */}

        <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Finance Overview
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              A quick look at your finances.
            </p>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-medium text-emerald-700">
                  Total Balance
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(
                    totalBalance
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-500">
                  Total Accounts
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {accounts.length}
                </p>
              </div>

            </div>
          )}
        </section>

        {/* ACCOUNTS */}

        <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Accounts
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your connected accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/accounts")
              }
              className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Wallet
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No accounts yet
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/accounts/new")
                }
                className="mt-2 text-sm font-semibold text-emerald-600"
              >
                Add an account
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {accounts.map((account) => {
                const Icon =
                  getAccountIcon(
                    account.type
                  );

                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/accounts/${account.id}`
                      )
                    }
                    className="group rounded-2xl border border-slate-100 p-4 text-left transition hover:border-emerald-100 hover:bg-[#f9fdfb]"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {account.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {getAccountTypeLabel(
                              account.type
                            )}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`whitespace-nowrap text-sm font-bold ${
                          account.balance < 0
                            ? "text-red-500"
                            : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(
                          account.balance
                        )}
                      </p>

                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* CATEGORIES */}

        <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Categories
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Add custom categories for your income and expenses.
            </p>
          </div>

          {/* CATEGORY ERROR */}

          {categoryError && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {categoryError}
              </p>
            </div>
          )}

          {/* CATEGORY CONTENT */}

          {categoryLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

              {/* EXPENSE */}

              <CategoryPanel
                title="Expense Categories"
                subtitle="Categories used when recording expenses."
                type="EXPENSE"
                categories={expenseCategories}
                newCategoryName={
                  newExpenseCategory
                }
                setNewCategoryName={
                  setNewExpenseCategory
                }
                adding={
                  addingCategoryType ===
                  "EXPENSE"
                }
                onAdd={() =>
                  handleAddCategory(
                    "EXPENSE"
                  )
                }
              />

              {/* INCOME */}

              <CategoryPanel
                title="Income Categories"
                subtitle="Categories used when recording income."
                type="INCOME"
                categories={incomeCategories}
                newCategoryName={
                  newIncomeCategory
                }
                setNewCategoryName={
                  setNewIncomeCategory
                }
                adding={
                  addingCategoryType ===
                  "INCOME"
                }
                onAdd={() =>
                  handleAddCategory(
                    "INCOME"
                  )
                }
              />

            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   PROFILE INFO CARD
------------------------------------------------------- */

function ProfileInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   CATEGORY PANEL
------------------------------------------------------- */

function CategoryPanel({
  title,
  subtitle,
  type,
  categories,
  newCategoryName,
  setNewCategoryName,
  adding,
  onAdd,
}: {
  title: string;
  subtitle: string;
  type: CategoryType;
  categories: CategorySummary[];
  newCategoryName: string;
  setNewCategoryName: (
    value: string
  ) => void;
  adding: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">

      {/* TITLE */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            type === "EXPENSE"
              ? "bg-red-50 text-red-500"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {type === "EXPENSE" ? (
            <Wallet size={17} />
          ) : (
            <Plus size={17} />
          )}
        </div>
      </div>

      {/* ADD CATEGORY */}

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(event) =>
            setNewCategoryName(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onAdd();
            }
          }}
          placeholder={
            type === "EXPENSE"
              ? "e.g. Travel"
              : "e.g. Bonus"
          }
          disabled={adding}
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#DCEBE1] bg-white px-4 text-sm text-[#17352A] outline-none transition placeholder:text-slate-300 focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25 disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={adding}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />

          <span className="hidden sm:inline">
            {adding ? "Adding..." : "Add"}
          </span>
        </button>
      </div>

      {/* CATEGORY LIST */}

      <div className="mt-5">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
            <p className="text-sm text-slate-400">
              No{" "}
              {type === "EXPENSE"
                ? "expense"
                : "income"}{" "}
              categories.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      type === "EXPENSE"
                        ? "bg-red-400"
                        : "bg-emerald-400"
                    }`}
                  />

                  <p className="truncate text-sm font-medium text-slate-800">
                    {category.name}
                  </p>
                </div>

                <Check
                  size={15}
                  className="shrink-0 text-emerald-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COUNT */}

      <div className="mt-4 text-xs text-slate-400">
        {categories.length}{" "}
        {categories.length === 1
          ? "category"
          : "categories"}
      </div>
    </div>
  );
}