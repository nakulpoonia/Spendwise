"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";

import {
  getAccounts,
  getAccountBalance,
} from "../../../services/accountService";

import {
  getTransactionsByAccount,
} from "../../../services/transactionService";

import type {
  AccountSummary,
  AccountType,
} from "../../../types/account";

import type {
  TransactionSummary,
} from "../../../types/transaction";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

interface AccountWithBalance extends AccountSummary {
  balance: number;
}

export default function AccountDetailsClient() {
  const router = useRouter();

  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [account, setAccount] =
    useState<AccountWithBalance | null>(null);

  const [transactions, setTransactions] = useState<
    TransactionSummary[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

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
     LOAD ACCOUNT + TRANSACTIONS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      return;
    }

    const loadAccountDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(accountId);

        if (Number.isNaN(id)) {
          throw new Error("Invalid account");
        }

        const [
          accounts,
          accountBalance,
          accountTransactions,
        ] = await Promise.all([
          getAccounts(),
          getAccountBalance(id),
          getTransactionsByAccount(id),
        ]);

        const selectedAccount = accounts.find(
          (item) => item.id === id
        );

        if (!selectedAccount) {
          throw new Error("Account not found");
        }

        setAccount({
          ...selectedAccount,
          balance: accountBalance,
        });

        setTransactions(accountTransactions);
      } catch (err) {
        console.error(err);
        setError("Unable to load account details.");
      } finally {
        setLoading(false);
      }
    };

    loadAccountDetails();
  }, [mounted, isAuthenticated, accountId]);

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
     TRANSACTION ICON
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

  /* -------------------------------------------------------
     TRANSACTION STYLE
  ------------------------------------------------------- */

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
     DATE
  ------------------------------------------------------- */

  const formatDate = (value: string) => {
    const datePart = value.split("T")[0];

    if (!datePart) {
      return value;
    }

    const [year, month, day] = datePart.split("-");

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

    if (!year || !month || !day) {
      return value;
    }

    return `${day} ${monthNames[Number(month) - 1]} ${year}`;
  };

  /* -------------------------------------------------------
     INITIAL / AUTH LOADING
  ------------------------------------------------------- */

  if (!mounted || authLoading || !isAuthenticated) {
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
     PAGE LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <main className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 rounded-3xl bg-white" />

            <div className="h-40 rounded-3xl bg-white" />

            <div className="h-96 rounded-3xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (error || !account) {
    return (
      <div
        className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
      >
        <main className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">
              {error || "Account not found."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/accounts")}
              className="mt-4 text-sm font-semibold text-emerald-600"
            >
              Back to Accounts
            </button>
          </div>
        </main>
      </div>
    );
  }

  const Icon = getAccountIcon(account.type);

  /* -------------------------------------------------------
     MAIN PAGE
  ------------------------------------------------------- */

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/accounts")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-sm font-medium text-slate-400">
              Accounts
            </p>

            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
              {account.name}
            </h1>
          </div>
        </header>

        {/* ACCOUNT SUMMARY */}

        <section className="mb-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_8px_30px_rgba(16,185,129,0.06)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Icon size={21} />
              </div>

              <div>
                <p className="text-xs font-medium capitalize text-slate-400">
                  {account.type
                    .replace("_", " ")
                    .toLowerCase()}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                Opening balance
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                {formatCurrency(
                  account.openingBalance
                )}
              </p>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS */}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Activity for {account.name}
            </p>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.map((transaction) => {
                const TransactionIcon =
                  getTransactionIcon(transaction);

                const style =
                  getTransactionStyle(transaction);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-2xl px-2 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                      >
                        <TransactionIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {transaction.description ||
                            transaction.type}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatDate(
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
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <ArrowLeftRight
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No transactions yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Transactions for this account will appear
                here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}