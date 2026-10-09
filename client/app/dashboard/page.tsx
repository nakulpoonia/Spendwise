"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Landmark,
  PiggyBank,
  Plus,
  Tags,
  Wallet,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getMonthlySummary } from "../../services/financialService";
import { getMonthlyBudgetProgress } from "../../services/monthlyBudgetService";
import { getRecentTransactions } from "../../services/transactionService";
import {
  getAccounts,
  getAccountBalance,
} from "../../services/accountService";

import AppNavbar from "../../components/AppNavbar";

import type { FinancialSummary } from "../../types/dashboard";
import type { MonthlyBudgetProgress } from "../../types/budget";
import type { TransactionSummary } from "../../types/transaction";
import type {
  AccountSummary,
  AccountType,
} from "../../types/account";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [summary, setSummary] =
    useState<FinancialSummary | null>(null);

  const [budget, setBudget] =
    useState<MonthlyBudgetProgress | null>(null);

  const [transactions, setTransactions] = useState<
    TransactionSummary[]
  >([]);

  const [accounts, setAccounts] = useState<
    (AccountSummary & { balance: number })[]
  >([]);

  const [currentYear, setCurrentYear] = useState<number | null>(
    null
  );

  const [currentMonth, setCurrentMonth] = useState<number | null>(
    null
  );

  const [monthLabel, setMonthLabel] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     SET CURRENT MONTH
  ------------------------------------------------------- */

  useEffect(() => {
    const date = new Date();

    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth() + 1);

    setMonthLabel(
      date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  /* -------------------------------------------------------
     AUTH REDIRECT
  ------------------------------------------------------- */

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  /* -------------------------------------------------------
     LOAD DASHBOARD
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      !isAuthenticated ||
      currentYear === null ||
      currentMonth === null
    ) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const monthValue = `${currentYear}-${String(
          currentMonth
        ).padStart(2, "0")}`;

        /*
         * Monthly budget is optional.
         *
         * A new user may not have created a monthly budget yet.
         * Treat "Monthly budget not found" as no budget.
         */
        const budgetPromise =
          getMonthlyBudgetProgress(
            currentYear,
            currentMonth
          ).catch((err: unknown) => {
            const message =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                  ? err
                  : String(err);

            if (
              message
                .toLowerCase()
                .includes("monthly budget not found")
            ) {
              return null;
            }

            throw err;
          });

        const [
          summaryData,
          budgetData,
          transactionData,
          accountData,
        ] = await Promise.all([
          getMonthlySummary(monthValue),

          budgetPromise,

          getRecentTransactions(5),

          getAccounts(),
        ]);

        setSummary(summaryData);
        setBudget(budgetData);
        setTransactions(transactionData.content ?? []);

        const accountsWithBalances = await Promise.all(
          accountData.map(async (account) => {
            const balance = await getAccountBalance(account.id);

            return {
              ...account,
              balance,
            };
          })
        );

        setAccounts(accountsWithBalances.slice(0, 3));
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isAuthenticated, currentYear, currentMonth]);

  /* -------------------------------------------------------
     FORMATTERS
  ------------------------------------------------------- */

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    });
  }, [user?.currency]);

  const formatCurrency = (amount: number) => {
    return currencyFormatter.format(amount);
  };

  const formatTransactionDate = (value: string) => {
    const datePart = value.split("T")[0];

    if (!datePart) {
      return value;
    }

    const [year, month, day] = datePart.split("-");

    if (!year || !month || !day) {
      return value;
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${day} ${monthNames[Number(month) - 1]} ${year}`;
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
     TRANSACTION ICON / COLORS
  ------------------------------------------------------- */

  const getTransactionIcon = (
    transaction: TransactionSummary
  ) => {
    if (transaction.type === "TRANSFER") {
      return ArrowLeftRight;
    }

    if (transaction.direction === "IN") {
      return ArrowDownLeft;
    }

    return ArrowUpRight;
  };

  const getTransactionStyle = (
    transaction: TransactionSummary
  ) => {
    if (transaction.type === "TRANSFER") {
      return {
        icon: "bg-slate-100 text-slate-500",
        amount: "text-slate-700",
        sign: "",
      };
    }

    if (transaction.direction === "IN") {
      return {
        icon: "bg-emerald-50 text-emerald-600",
        amount: "text-emerald-600",
        sign: "+",
      };
    }

    return {
      icon: "bg-red-50 text-red-500",
      amount: "text-red-500",
      sign: "-",
    };
  };

  /* -------------------------------------------------------
     BUDGET
  ------------------------------------------------------- */

  const budgetProgress =
    budget && budget.budgetAmount > 0
      ? Math.min(
          (budget.spentAmount / budget.budgetAmount) * 100,
          100
        )
      : 0;

  const budgetPercentage =
    budget && budget.budgetAmount > 0
      ? (budget.spentAmount / budget.budgetAmount) * 100
      : 0;

  const budgetColor =
    budgetPercentage <= 60
      ? {
          bar: "bg-emerald-500",
          badge: "bg-emerald-50 text-emerald-600",
        }
      : budgetPercentage <= 80
        ? {
            bar: "bg-amber-400",
            badge: "bg-amber-50 text-amber-600",
          }
        : {
            bar: "bg-red-500",
            badge: "bg-red-50 text-red-500",
          };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (authLoading || !isAuthenticated) {
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

  if (
    loading ||
    currentYear === null ||
    currentMonth === null
  ) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 rounded-3xl bg-white" />

            <div className="h-48 rounded-3xl bg-white" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-32 rounded-2xl bg-white" />
              <div className="h-32 rounded-2xl bg-white" />
              <div className="h-32 rounded-2xl bg-white" />
              <div className="h-32 rounded-2xl bg-white" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-80 rounded-3xl bg-white" />
              <div className="h-80 rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (error) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <AppNavbar activePage="dashboard" />

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-semibold text-emerald-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     DASHBOARD
  ------------------------------------------------------- */

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* NAVBAR */}

        <AppNavbar activePage="dashboard" />

        {/* HEADER */}

        <header className="mt-7 mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Welcome back
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {user?.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/transactions/new")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus size={16} />
              New Transaction
            </button>
          </div>
        </header>

        {/* MONTHLY BUDGET */}

        <section className="mb-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgba(16,185,129,0.06)] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Monthly Budget
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {monthLabel}
              </h2>
            </div>

            {budget && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${budgetColor.badge}`}
              >
                {budgetPercentage > 100
                  ? "Over budget"
                  : `${Math.round(
                      budgetPercentage
                    )}% used`}
              </span>
            )}
          </div>

          {budget ? (
            <>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(
                      budget.spentAmount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    of{" "}
                    {formatCurrency(
                      budget.budgetAmount
                    )}{" "}
                    spent
                  </p>
                </div>

                <div className="text-right">
                  {budget.remainingAmount >= 0 ? (
                    <>
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(
                          budget.remainingAmount
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        remaining
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-red-500">
                        {formatCurrency(
                          Math.abs(
                            budget.remainingAmount
                          )
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        over budget
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${budgetColor.bar}`}
                  style={{
                    width: `${budgetProgress}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="py-5 text-center">
              <p className="text-sm text-slate-500">
                No monthly budget set for this month.
              </p>
            </div>
          )}

          {/* CATEGORY SPENDING */}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() =>
                router.push("/budget/categories")
              }
              className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              <Tags
                size={16}
                className="shrink-0"
              />

              View category spending

              <ChevronRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="mt-1 text-xs text-slate-400">
              See how much you have spent in each expense
              category.
            </p>
          </div>
        </section>

        {/* SUMMARY CARDS */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Balance"
            value={formatCurrency(
              summary?.totalBalance ?? 0
            )}
            icon={Wallet}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            label="Income"
            value={formatCurrency(
              summary?.totalIncome ?? 0
            )}
            icon={ArrowDownLeft}
            iconClass="bg-emerald-50 text-emerald-600"
            valueClass="text-emerald-600"
          />

          <SummaryCard
            label="Expenses"
            value={formatCurrency(
              summary?.totalExpense ?? 0
            )}
            icon={ArrowUpRight}
            iconClass="bg-red-50 text-red-500"
            valueClass="text-red-500"
          />

          <SummaryCard
            label="Net"
            value={formatCurrency(
              summary?.net ?? 0
            )}
            icon={IndianRupee}
            iconClass="bg-slate-100 text-slate-600"
          />
        </section>

        {/* ACCOUNTS + RECENT TRANSACTIONS */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ACCOUNTS */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Accounts
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Your connected accounts
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

            <div className="space-y-3">
              {accounts.length > 0 ? (
                accounts.map((account) => {
                  const Icon = getAccountIcon(
                    account.type
                  );

                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3.5 transition hover:border-emerald-100 hover:bg-[#f9fdfb]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {account.name}
                          </p>

                          <p className="mt-0.5 text-xs capitalize text-slate-400">
                            {account.type
                              .replace(
                                "_",
                                " "
                              )
                              .toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`ml-4 whitespace-nowrap text-sm font-bold ${
                          account.balance >= 0
                            ? "text-slate-900"
                            : "text-red-500"
                        }`}
                      >
                        {formatCurrency(
                          account.balance
                        )}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
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
                      router.push("/accounts")
                    }
                    className="mt-2 text-sm font-semibold text-emerald-600"
                  >
                    Add an account
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RECENT TRANSACTIONS */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Your latest activity
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/transactions")
                }
                className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-1">
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const Icon =
                    getTransactionIcon(
                      transaction
                    );

                  const style =
                    getTransactionStyle(
                      transaction
                    );

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-2xl px-2 py-3 transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {transaction.description ||
                              transaction.type}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatTransactionDate(
                              transaction.transactionDate
                            )}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`ml-4 whitespace-nowrap text-sm font-bold ${style.amount}`}
                      >
                        {style.sign}
                        {formatCurrency(
                          transaction.amount
                        )}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <ArrowLeftRight
                    size={24}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No transactions yet
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/transactions/new"
                      )
                    }
                    className="mt-2 text-sm font-semibold text-emerald-600"
                  >
                    Add a transaction
                  </button>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   SUMMARY CARD
------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p
        className={`mt-4 text-xl font-bold tracking-tight ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}