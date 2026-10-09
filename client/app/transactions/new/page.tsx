"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";

import { getAccounts } from "../../../services/accountService";

import {
  createExpense,
  createIncome,
  createTransfer,
} from "../../../services/transactionService";

import {
  getCategoriesByType,
} from "../../../services/categoryService";

import type {
  AccountSummary,
  AccountType,
} from "../../../types/account";

import type {
  CategorySummary,
} from "../../../types/category";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

type TransactionTab =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER";

interface AddedTransaction {
  id: number;
  type: TransactionTab;
  amount: number;
  description: string;
  transactionDate: string;
  accountName?: string;
  categoryName?: string;
  sourceAccountName?: string;
  destinationAccountName?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [activeTab, setActiveTab] =
    useState<TransactionTab>("EXPENSE");

  const [accounts, setAccounts] = useState<
    AccountSummary[]
  >([]);

  const [categories, setCategories] = useState<
    CategorySummary[]
  >([]);

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [sourceAccountId, setSourceAccountId] =
    useState("");

  const [destinationAccountId, setDestinationAccountId] =
    useState("");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [addedTransactions, setAddedTransactions] =
    useState<AddedTransaction[]>([]);

  /* -------------------------------------------------------
     MOUNT
  ------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------------------------------------------
     AUTH REDIRECT
  ------------------------------------------------------- */

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    mounted,
    authLoading,
    isAuthenticated,
    router,
  ]);

  /* -------------------------------------------------------
     DEFAULT DATE
  ------------------------------------------------------- */

  const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const hours = String(
      now.getHours()
    ).padStart(2, "0");

    const minutes = String(
      now.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setTransactionDate(getCurrentDateTime());
  }, [mounted]);

  /* -------------------------------------------------------
     LOAD ACCOUNTS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      return;
    }

    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAccounts();

        setAccounts(data);

        if (data.length > 0) {
          setAccountId(String(data[0].id));

          setSourceAccountId(
            String(data[0].id)
          );

          const secondAccount = data.find(
            (account) =>
              account.id !== data[0].id
          );

          if (secondAccount) {
            setDestinationAccountId(
              String(secondAccount.id)
            );
          }
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load your accounts.");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [mounted, isAuthenticated]);

  /* -------------------------------------------------------
     LOAD CATEGORIES
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      !mounted ||
      !isAuthenticated ||
      activeTab === "TRANSFER"
    ) {
      return;
    }

    const loadCategories = async () => {
      try {
        setError("");

        const data = await getCategoriesByType(
          activeTab
        );

        setCategories(data);

        if (data.length > 0) {
          setCategoryId(String(data[0].id));
        } else {
          setCategoryId("");
        }
      } catch (err) {
        console.error(err);

        setCategories([]);
        setCategoryId("");

        setError(
          "Unable to load transaction categories."
        );
      }
    };

    loadCategories();
  }, [
    mounted,
    isAuthenticated,
    activeTab,
  ]);

  /* -------------------------------------------------------
     RESET TYPE-SPECIFIC FIELDS
  ------------------------------------------------------- */

  const handleTabChange = (
    tab: TransactionTab
  ) => {
    setActiveTab(tab);
    setError("");
    setSuccess(false);

    setAmount("");
    setDescription("");

    if (tab === "TRANSFER") {
      setCategoryId("");
    }
  };

  /* -------------------------------------------------------
     RESET FORM FOR NEXT TRANSACTION
  ------------------------------------------------------- */

  const resetFormForNextTransaction = () => {
    setAmount("");
    setDescription("");
    setError("");
    setSuccess(true);
    setTransactionDate(getCurrentDateTime());

    if (activeTab !== "TRANSFER") {
      if (categories.length > 0) {
        setCategoryId(String(categories[0].id));
      } else {
        setCategoryId("");
      }
    }
  };

  /* -------------------------------------------------------
     ACCOUNT ICON
  ------------------------------------------------------- */

  const getAccountIcon = (
    type: AccountType
  ) => {
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
     TRANSACTION TYPE LABEL
  ------------------------------------------------------- */

  const getTransactionTypeLabel = (
    type: TransactionTab
  ) => {
    switch (type) {
      case "INCOME":
        return "Income";

      case "EXPENSE":
        return "Expense";

      case "TRANSFER":
        return "Transfer";

      default:
        return type;
    }
  };

  /* -------------------------------------------------------
     DATE DISPLAY
  ------------------------------------------------------- */

  const formatTransactionDate = (
    value: string
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError(
        "Please enter an amount greater than zero."
      );

      return;
    }

    if (!transactionDate) {
      setError(
        "Please select a transaction date."
      );

      return;
    }

    if (activeTab !== "TRANSFER") {
      if (!accountId) {
        setError("Please select an account.");
        return;
      }

      if (!categoryId) {
        setError("Please select a category.");
        return;
      }
    }

    if (activeTab === "TRANSFER") {
      if (!sourceAccountId) {
        setError(
          "Please select the source account."
        );

        return;
      }

      if (!destinationAccountId) {
        setError(
          "Please select the destination account."
        );

        return;
      }

      if (
        sourceAccountId ===
        destinationAccountId
      ) {
        setError(
          "Source and destination accounts must be different."
        );

        return;
      }
    }

    try {
      setSubmitting(true);

      const commonData = {
        amount: numericAmount,
        description:
          description.trim() || null,
        transactionDate,
      };

      if (activeTab === "INCOME") {
        await createIncome({
          ...commonData,
          accountId: Number(accountId),
          categoryId: Number(categoryId),
        });
      }

      if (activeTab === "EXPENSE") {
        await createExpense({
          ...commonData,
          accountId: Number(accountId),
          categoryId: Number(categoryId),
        });
      }

      if (activeTab === "TRANSFER") {
        await createTransfer({
          ...commonData,
          sourceAccountId:
            Number(sourceAccountId),
          destinationAccountId:
            Number(destinationAccountId),
        });
      }

      const selectedAccount = accounts.find(
        (account) =>
          account.id === Number(accountId)
      );

      const selectedCategory = categories.find(
        (category) =>
          category.id === Number(categoryId)
      );

      const selectedSourceAccount =
        accounts.find(
          (account) =>
            account.id ===
            Number(sourceAccountId)
        );

      const selectedDestinationAccount =
        accounts.find(
          (account) =>
            account.id ===
            Number(destinationAccountId)
        );

      const addedTransaction: AddedTransaction = {
        id: Date.now(),
        type: activeTab,
        amount: numericAmount,
        description:
          description.trim(),
        transactionDate,

        accountName:
          activeTab !== "TRANSFER"
            ? selectedAccount?.name
            : undefined,

        categoryName:
          activeTab !== "TRANSFER"
            ? selectedCategory?.name
            : undefined,

        sourceAccountName:
          activeTab === "TRANSFER"
            ? selectedSourceAccount?.name
            : undefined,

        destinationAccountName:
          activeTab === "TRANSFER"
            ? selectedDestinationAccount?.name
            : undefined,
      };

      setAddedTransactions((previous) => [
        ...previous,
        addedTransaction,
      ]);

      resetFormForNextTransaction();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     CURRENCY
  ------------------------------------------------------- */

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

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

  if (loading) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 rounded-2xl bg-white" />

            <div className="h-[600px] rounded-3xl bg-white" />
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
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              disabled={submitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="text-sm font-medium text-slate-500">
                SpendWise
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                New Transaction
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/transactions")
            }
            className="hidden text-sm font-semibold text-slate-500 transition hover:text-emerald-600 sm:block"
          >
            View transactions
          </button>
        </header>

        {/* ADDED TRANSACTIONS */}

        {addedTransactions.length > 0 && (
          <section className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Added Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {addedTransactions.length}{" "}
                  {addedTransactions.length === 1
                    ? "transaction"
                    : "transactions"}{" "}
                  added in this session.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <Check
                  size={17}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {addedTransactions.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              transaction.type ===
                              "EXPENSE"
                                ? "bg-red-50 text-red-500"
                                : transaction.type ===
                                  "INCOME"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {transaction.type ===
                            "EXPENSE" ? (
                              <ArrowUpRight
                                size={15}
                              />
                            ) : transaction.type ===
                              "INCOME" ? (
                              <ArrowDownLeft
                                size={15}
                              />
                            ) : (
                              <ArrowLeftRight
                                size={15}
                              />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {getTransactionTypeLabel(
                                transaction.type
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatTransactionDate(
                                transaction.transactionDate
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-500">
                          {transaction.type ===
                          "TRANSFER" ? (
                            <span>
                              {transaction.sourceAccountName ||
                                "Source account"}{" "}
                              →{" "}
                              {transaction.destinationAccountName ||
                                "Destination account"}
                            </span>
                          ) : (
                            <span>
                              {transaction.accountName ||
                                "Account"}{" "}
                              ·{" "}
                              {transaction.categoryName ||
                                "Category"}
                            </span>
                          )}
                        </div>

                        {transaction.description && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {transaction.description}
                          </p>
                        )}
                      </div>

                      <p
                        className={`shrink-0 text-sm font-bold ${
                          transaction.type ===
                          "EXPENSE"
                            ? "text-red-500"
                            : transaction.type ===
                              "INCOME"
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        {formatCurrency(
                          transaction.amount
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* FORM CARD */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">

          {/* TRANSACTION TYPE */}

          <div className="mb-7">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Transaction type
            </p>

            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() =>
                  handleTabChange("EXPENSE")
                }
                disabled={submitting}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  activeTab === "EXPENSE"
                    ? "bg-white text-red-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <ArrowUpRight size={17} />
                Expense
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTabChange("INCOME")
                }
                disabled={submitting}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  activeTab === "INCOME"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <ArrowDownLeft size={17} />
                Income
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTabChange("TRANSFER")
                }
                disabled={submitting}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  activeTab === "TRANSFER"
                    ? "bg-white text-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <ArrowLeftRight size={17} />
                Transfer
              </button>
            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ACCOUNT / TRANSFER ACCOUNTS */}

            {activeTab === "TRANSFER" ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* SOURCE */}

                <SelectField
                  label="From account"
                  value={sourceAccountId}
                  onChange={setSourceAccountId}
                  placeholder="Select source account"
                  options={accounts.map(
                    (account) => ({
                      value: String(
                        account.id
                      ),
                      label: account.name,
                    })
                  )}
                />

                {/* DESTINATION */}

                <SelectField
                  label="To account"
                  value={destinationAccountId}
                  onChange={
                    setDestinationAccountId
                  }
                  placeholder="Select destination account"
                  options={accounts.map(
                    (account) => ({
                      value: String(
                        account.id
                      ),
                      label: account.name,
                    })
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <SelectField
                  label="Account"
                  value={accountId}
                  onChange={setAccountId}
                  placeholder="Select account"
                  options={accounts.map(
                    (account) => ({
                      value: String(
                        account.id
                      ),
                      label: account.name,
                    })
                  )}
                />

                <SelectField
                  label="Category"
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Select category"
                  options={categories.map(
                    (category) => ({
                      value: String(
                        category.id
                      ),
                      label: category.name,
                    })
                  )}
                />
              </div>
            )}

            {/* AMOUNT */}

            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Amount
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {user?.currency === "INR"
                    ? "₹"
                    : user?.currency || "$"}
                </span>

                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            {/* DATE */}

            <div>
              <label
                htmlFor="transactionDate"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="transactionDate"
                  type="datetime-local"
                  value={transactionDate}
                  onChange={(event) =>
                    setTransactionDate(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder={
                  activeTab === "TRANSFER"
                    ? "e.g. Transfer to savings"
                    : activeTab === "INCOME"
                    ? "e.g. Monthly salary"
                    : "e.g. Dinner at restaurant"
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <Check
                  size={17}
                  className="shrink-0 text-emerald-600"
                />

                <p className="text-sm font-medium text-emerald-600">
                  Transaction added successfully. You can add another transaction.
                </p>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push("/transactions")
                }
                disabled={submitting}
                className="h-12 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-xl bg-emerald-500 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : "Save Transaction"}
              </button>

              {addedTransactions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    router.push("/transactions")
                  }
                  disabled={submitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check
                    size={17}
                    strokeWidth={2.5}
                  />
                  Done
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   SELECT FIELD
------------------------------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}