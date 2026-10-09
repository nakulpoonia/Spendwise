"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  PiggyBank,
  Save,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import AppNavbar from "../../../components/AppNavbar";

import {
  createMonthlyBudget,
  getMonthlyBudgetProgress,
} from "../../../services/budgetService";

import type {
  MonthlyBudgetProgress,
} from "../../../services/budgetService";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

/* -------------------------------------------------------
   MONTHS
------------------------------------------------------- */

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

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default function MonthlyBudgetPage() {
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

  const [budget, setBudget] =
    useState<MonthlyBudgetProgress | null>(null);

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
     LOAD BUDGET
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated || !dateInitialized) {
      return;
    }

    const loadBudget = async () => {
      try {
        setLoading(true);
        setError("");

        const progress =
          await getMonthlyBudgetProgress(
            year,
            month
          );

        setBudget(progress);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : String(err);

        if (
          message
            .toLowerCase()
            .includes("monthly budget not found")
        ) {
          setBudget(null);
        } else {
          console.error(err);
          setError(
            "Unable to load monthly budget."
          );
          setBudget(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
  }, [isAuthenticated, dateInitialized, year, month]);

  /* -------------------------------------------------------
     FORMAT CURRENCY
  ------------------------------------------------------- */

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  const percentage =
    budget && budget.budgetAmount > 0
      ? (budget.spentAmount /
          budget.budgetAmount) *
        100
      : 0;

  const progressWidth = Math.min(
    percentage,
    100
  );

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

  /* -------------------------------------------------------
     CREATE BUDGET
  ------------------------------------------------------- */

  const handleCreateBudget = async () => {
    setError("");

    const amount = Number(budgetAmount);

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

    try {
      setSaving(true);

      await createMonthlyBudget({
        budgetAmount: amount,
        year,
        month,
      });

      const progress =
        await getMonthlyBudgetProgress(
          year,
          month
        );

      setBudget(progress);
      setBudgetAmount("");
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create monthly budget."
      );
    } finally {
      setSaving(false);
    }
  };

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

            <div className="h-72 rounded-3xl bg-white" />

            <div className="h-40 rounded-3xl bg-white" />
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
              Monthly Budget
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Set an overall spending limit for a
              specific month and keep track of how much
              you've used.
            </p>
          </div>
        </header>

        {/* MONTH SELECTOR */}

        <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Budget period
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Choose the month you want to manage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div>
                <label
                  htmlFor="budget-month"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Month
                </label>

                <select
                  id="budget-month"
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
                  htmlFor="budget-year"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Year
                </label>

                <select
                  id="budget-year"
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

        {/* EXISTING BUDGET */}

        {budget ? (
          <section className="mb-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgba(16,185,129,0.06)] sm:p-7">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <PiggyBank size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {MONTHS[month - 1]} {year}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Monthly spending limit
                    </h2>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                >
                  {percentage > 100
                    ? "Over budget"
                    : `${Math.round(percentage)}% used`}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                  <p className="text-xs font-medium text-slate-400">
                    Budget
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(
                      budget.budgetAmount
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                  <p className="text-xs font-medium text-slate-400">
                    Spent
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-red-500">
                    {formatCurrency(
                      budget.spentAmount
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                  <p className="text-xs font-medium text-slate-400">
                    {budget.remainingAmount >= 0
                      ? "Remaining"
                      : "Over by"}
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold tracking-tight ${
                      budget.remainingAmount >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(
                      Math.abs(
                        budget.remainingAmount
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
                    {Math.round(percentage)}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor}`}
                    style={{
                      width: `${progressWidth}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-xs leading-5 text-slate-600">
                  This month's budget is already set.
                  Your expenses will automatically update
                  this progress.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* CREATE BUDGET */
          <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <PiggyBank size={22} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Set your monthly budget
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Decide the maximum amount you want
                  to spend during{" "}
                  <span className="font-semibold text-slate-700">
                    {MONTHS[month - 1]} {year}
                  </span>
                  .
                </p>
              </div>

              <div className="w-full max-w-md">
                <label
                  htmlFor="monthly-budget-amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Budget amount
                </label>

                <input
                  id="monthly-budget-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(event) =>
                    setBudgetAmount(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 30000"
                  className="h-12 w-full rounded-xl border border-[#DCEBE1] bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                />

                <button
                  type="button"
                  onClick={handleCreateBudget}
                  disabled={saving}
                  className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {saving
                    ? "Saving budget..."
                    : "Set monthly budget"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* INFO */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <CalendarDays size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                How monthly budgets work
              </h3>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                Your monthly budget covers all expense
                categories for the selected month. Every
                expense you record contributes to the
                amount spent and updates the progress
                automatically.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
