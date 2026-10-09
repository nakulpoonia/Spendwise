"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Plus,
  Tags,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import AppNavbar from "../../../components/AppNavbar";

import {
  createCategoryBudget,
  getCategoryBudgetProgress,
  getCategoryBudgets,
  getExpenseCategories,
} from "../../../services/budgetService";

import type {
  CategoryBudgetProgress,
  CategoryBudgetSummary,
  ExpenseCategory,
} from "../../../services/budgetService";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getYearOptions(currentYear: number) {
  return Array.from(
    { length: 8 },
    (_, index) => currentYear - 2 + index
  );
}

interface BudgetWithProgress
  extends CategoryBudgetSummary {
  progress: CategoryBudgetProgress | null;
}

export default function CategoryBudgetsPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(1);

  useEffect(() => {
    const currentDate = new Date();
    const initialYear = currentDate.getFullYear();

    setCurrentYear(initialYear);
    setYear(initialYear);
    setMonth(currentDate.getMonth() + 1);
    setDateInitialized(true);
  }, []);

  const [categories, setCategories] = useState<
    ExpenseCategory[]
  >([]);

  const [budgets, setBudgets] = useState<
    BudgetWithProgress[]
  >([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [budgetAmount, setBudgetAmount] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     AUTH REDIRECT
  ------------------------------------------------------- */

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    authLoading,
    isAuthenticated,
    router,
  ]);

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated || !dateInitialized) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          categoryData,
          budgetData,
        ] = await Promise.all([
          getExpenseCategories(),
          getCategoryBudgets(),
        ]);

        const monthBudgets =
          budgetData.filter(
            (budget) =>
              budget.year === year &&
              budget.month === month
          );

        const progressData =
          await Promise.all(
            monthBudgets.map(
              async (budget) => {
                try {
                  const progress =
                    await getCategoryBudgetProgress(
                      budget.id
                    );

                  return {
                    ...budget,
                    progress,
                  };
                } catch (err) {
                  console.error(
                    `Unable to load budget ${budget.id}`,
                    err
                  );

                  return {
                    ...budget,
                    progress: null,
                  };
                }
              }
            )
          );

        setCategories(categoryData);
        setBudgets(progressData);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load category budgets."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    isAuthenticated,
    dateInitialized,
    year,
    month,
  ]);

  /* -------------------------------------------------------
     CURRENCY
  ------------------------------------------------------- */

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /* -------------------------------------------------------
     CREATE CATEGORY BUDGET
  ------------------------------------------------------- */

  const handleCreateBudget = async () => {
    setError("");

    const categoryId = Number(
      selectedCategoryId
    );

    const amount = Number(budgetAmount);

    if (
      !selectedCategoryId ||
      Number.isNaN(categoryId)
    ) {
      setError(
        "Please select an expense category."
      );
      return;
    }

    if (
      budgetAmount.trim() === "" ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setError(
        "Budget amount must be greater than zero."
      );
      return;
    }

    const alreadyExists = budgets.some(
      (budget) => {
        const category = categories.find(
          (item) =>
            item.name === budget.categoryName
        );

        return (
          category?.id === categoryId
        );
      }
    );

    if (alreadyExists) {
      setError(
        "A budget already exists for this category and month."
      );
      return;
    }

    try {
      setSaving(true);

      await createCategoryBudget({
        categoryId,
        budgetAmount: amount,
        year,
        month,
      });

      setSelectedCategoryId("");
      setBudgetAmount("");

      /* Refresh */

      const budgetData =
        await getCategoryBudgets();

      const monthBudgets =
        budgetData.filter(
          (budget) =>
            budget.year === year &&
            budget.month === month
        );

      const progressData =
        await Promise.all(
          monthBudgets.map(
            async (budget) => {
              try {
                const progress =
                  await getCategoryBudgetProgress(
                    budget.id
                  );

                return {
                  ...budget,
                  progress,
                };
              } catch {
                return {
                  ...budget,
                  progress: null,
                };
              }
            }
          )
        );

      setBudgets(progressData);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create category budget."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     AVAILABLE CATEGORIES
  ------------------------------------------------------- */

  const availableCategories =
    categories.filter((category) => {
      return !budgets.some(
        (budget) =>
          budget.categoryName ===
          category.name
      );
    });

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (authLoading || !isAuthenticated) {
    return (
      <main
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <AppNavbar activePage="budget" />

          <div className="mt-6 animate-pulse space-y-6">
            <div className="h-32 rounded-3xl bg-white" />

            <div className="h-64 rounded-3xl bg-white" />

            <div className="h-96 rounded-3xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------
     MAIN PAGE
  ------------------------------------------------------- */

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <AppNavbar activePage="budget" />

        {/* HEADER */}

        <header className="mt-8 mb-7 flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.push("/budget")}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
            aria-label="Back to budget"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Budget
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Category Budgets
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Set individual spending limits for the
              expense categories you use most.
            </p>
          </div>
        </header>

        {/* PERIOD */}

        <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Budget period
              </p>

              <p className="mt-1 text-xs text-slate-400">
                View and manage category budgets for a
                specific month.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div>
                <label
                  htmlFor="category-budget-month"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Month
                </label>

                <select
                  id="category-budget-month"
                  value={month}
                  onChange={(event) =>
                    setMonth(
                      Number(event.target.value)
                    )
                  }
                  className="h-11 min-w-[150px] rounded-xl border border-[#DCEBE1] bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                >
                  {MONTHS.map((name, index) => (
                    <option
                      key={name}
                      value={index + 1}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category-budget-year"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Year
                </label>

                <select
                  id="category-budget-year"
                  value={year}
                  disabled={currentYear === null}
                  onChange={(event) =>
                    setYear(
                      Number(event.target.value)
                    )
                  }
                  className="h-11 min-w-[120px] rounded-xl border border-[#DCEBE1] bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                >
                  {currentYear === null ? (
                    <option value={year}>Loading years...</option>
                  ) : (
                    getYearOptions(currentYear).map(
                      (optionYear) => (
                        <option
                          key={optionYear}
                          value={optionYear}
                        >
                          {optionYear}
                        </option>
                      )
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* CREATE */}

        <section className="mb-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgba(16,185,129,0.05)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Tags size={22} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Add a category budget
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose one of your existing expense
                categories and decide how much you want to
                spend on it during{" "}
                <span className="font-semibold text-slate-700">
                  {MONTHS[month - 1]} {year}
                </span>
                .
              </p>
            </div>

            <div className="grid w-full max-w-xl gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
              <div>
                <label
                  htmlFor="budget-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Expense category
                </label>

                <select
                  id="budget-category"
                  value={selectedCategoryId}
                  onChange={(event) =>
                    setSelectedCategoryId(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-[#DCEBE1] bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                >
                  <option value="">
                    Select category
                  </option>

                  {availableCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category-budget-amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Limit
                </label>

                <input
                  id="category-budget-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(event) =>
                    setBudgetAmount(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 5000"
                  className="h-12 w-full rounded-xl border border-[#DCEBE1] bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateBudget}
                disabled={
                  saving ||
                  availableCategories.length === 0
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />

                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </div>

          {availableCategories.length === 0 && (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
              <p className="text-xs font-medium text-slate-600">
                {categories.length === 0
                  ? "You don't have any expense categories yet."
                  : "All your expense categories already have a budget for this month."}
              </p>
            </div>
          )}
        </section>

        {/* BUDGET LIST */}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your category budgets
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {MONTHS[month - 1]} {year}
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {budgets.length}{" "}
              {budgets.length === 1
                ? "budget"
                : "budgets"}
            </span>
          </div>

          {budgets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <CircleDollarSign size={22} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No category budgets yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                Add a budget above to start tracking
                spending for individual categories.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const progress =
                  budget.progress;

                const percentage =
                  progress &&
                  progress.budgetAmount > 0
                    ? (progress.spentAmount /
                        progress.budgetAmount) *
                      100
                    : 0;

                const progressWidth =
                  Math.min(percentage, 100);

                const progressColor =
                  percentage <= 60
                    ? "bg-emerald-500"
                    : percentage <= 80
                      ? "bg-amber-400"
                      : "bg-red-500";

                const badgeClass =
                  percentage <= 60
                    ? "bg-emerald-50 text-emerald-600"
                    : percentage <= 80
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500";

                return (
                  <article
                    key={budget.id}
                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Tags size={18} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-slate-900">
                              {budget.categoryName}
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              Monthly category limit
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                        >
                          {progress
                            ? percentage > 100
                              ? "Over budget"
                              : `${Math.round(
                                  percentage
                                )}% used`
                            : "Loading"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Budget
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatCurrency(
                              budget.budgetAmount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Spent
                          </p>

                          <p className="mt-1 text-lg font-bold text-red-500">
                            {formatCurrency(
                              progress?.spentAmount ??
                                0
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            {(
                              progress?.remainingAmount ??
                              0
                            ) >= 0
                              ? "Remaining"
                              : "Over by"}
                          </p>

                          <p
                            className={`mt-1 text-lg font-bold ${
                              (
                                progress?.remainingAmount ??
                                0
                              ) >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {formatCurrency(
                              Math.abs(
                                progress?.remainingAmount ??
                                  0
                              )
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-500">
                            Spending progress
                          </p>

                          <p className="text-xs font-semibold text-slate-500">
                            {Math.round(
                              percentage
                            )}
                            %
                          </p>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor}`}
                            style={{
                              width: `${progressWidth}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#fbfdfc] px-3 py-2.5">
                        <Check
                          size={15}
                          className="shrink-0 text-emerald-600"
                        />

                        <p className="text-xs text-slate-500">
                          Expenses in this category
                          automatically contribute to
                          this budget.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
