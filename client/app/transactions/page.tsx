"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  Plus,
} from "lucide-react";

import AppNavbar from "../../components/AppNavbar";
import { useAuth } from "../../hooks/useAuth";
import { getRecentTransactions } from "../../services/transactionService";

import type {
  TransactionSummary,
  TransactionType,
} from "../../types/transaction";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

type FilterType =
  | "ALL"
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER";

export default function TransactionsPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [transactions, setTransactions] =
    useState<TransactionSummary[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("ALL");

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      !authLoading &&
      !isAuthenticated
    ) {
      router.replace("/login");
    }
  }, [
    mounted,
    authLoading,
    isAuthenticated,
    router,
  ]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      return;
    }

    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getRecentTransactions(50);

        setTransactions(data.content);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transactions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [mounted, isAuthenticated]);

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.type === filter
    );
  }, [transactions, filter]);

  const formatAmount = (
    transaction: TransactionSummary
  ) => {
    const amount = new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: user?.currency || "INR",
        maximumFractionDigits: 2,
      }
    ).format(transaction.amount);

    if (transaction.type === "INCOME") {
      return `+${amount}`;
    }

    if (transaction.type === "EXPENSE") {
      return `-${amount}`;
    }

    return amount;
  };

  const formatDate = (
    transactionDate: string
  ) => {
    const date = new Date(transactionDate);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTransactionIcon = (
    type: TransactionType
  ) => {
    if (type === "INCOME") {
      return <ArrowDownLeft size={18} />;
    }

    if (type === "EXPENSE") {
      return <ArrowUpRight size={18} />;
    }

    return <ArrowLeftRight size={18} />;
  };

  const getIconClasses = (
    type: TransactionType
  ) => {
    if (type === "INCOME") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (type === "EXPENSE") {
      return "bg-red-50 text-red-500";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getAmountClasses = (
    type: TransactionType
  ) => {
    if (type === "INCOME") {
      return "text-emerald-600";
    }

    if (type === "EXPENSE") {
      return "text-red-500";
    }

    return "text-slate-700";
  };

  if (
    !mounted ||
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

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* SHARED NAVBAR */}

        <AppNavbar activePage="transactions" />

        {/* PAGE HEADER */}

        <header className="mb-7 mt-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              SpendWise
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Keep track of your income, expenses and transfers.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/transactions/new")
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus
              size={17}
              strokeWidth={2.5}
            />

            <span className="hidden sm:inline">
              New Transaction
            </span>

            <span className="sm:hidden">
              New
            </span>
          </button>
        </header>

        {/* TRANSACTIONS CARD */}

        <section className="rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  All Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Showing your latest transactions
                </p>
              </div>

              <div className="flex w-full overflow-x-auto rounded-xl bg-slate-50 p-1 sm:w-auto">
                {(
                  [
                    ["ALL", "All"],
                    ["INCOME", "Income"],
                    ["EXPENSE", "Expense"],
                    ["TRANSFER", "Transfer"],
                  ] as [FilterType, string][]
                ).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(value)
                      }
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        filter === value
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-5 pt-5 sm:px-6">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>

                    <div className="h-4 w-20 rounded bg-slate-100" />
                  </div>
                )
              )}
            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <ArrowLeftRight size={23} />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900">
                No transactions found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {filter === "ALL"
                  ? "Start adding transactions to keep track of your finances."
                  : `You don't have any ${filter.toLowerCase()} transactions yet.`}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/transactions/new"
                  )
                }
                className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <Plus size={16} />
                New Transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconClasses(
                        transaction.type
                      )}`}
                    >
                      {getTransactionIcon(
                        transaction.type
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {transaction.description ||
                          (transaction.type ===
                          "INCOME"
                            ? "Income"
                            : transaction.type ===
                              "EXPENSE"
                            ? "Expense"
                            : "Transfer")}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">
                          {transaction.type ===
                          "INCOME"
                            ? "Income"
                            : transaction.type ===
                              "EXPENSE"
                            ? "Expense"
                            : "Transfer"}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            transaction.transactionDate
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${getAmountClasses(
                          transaction.type
                        )}`}
                      >
                        {formatAmount(
                          transaction
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {transaction.direction ===
                        "IN"
                          ? "Received"
                          : transaction.direction ===
                            "OUT"
                          ? "Spent"
                          : ""}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="hidden text-slate-300 transition group-hover:text-slate-500 sm:block"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {!loading &&
            filteredTransactions.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {
                      filteredTransactions.length
                    }
                  </span>{" "}
                  transaction
                  {filteredTransactions.length !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}