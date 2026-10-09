"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
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

import type {
  AccountSummary,
  AccountType,
} from "../../types/account";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function AccountsPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [accounts, setAccounts] = useState<
    AccountSummary[]
  >([]);

  const [balances, setBalances] = useState<
    Record<number, number>
  >({});

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

    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const accountData =
          await getAccounts();

        setAccounts(accountData);

        const balanceEntries =
          await Promise.all(
            accountData.map(async (account) => {
              try {
                const balance =
                  await getAccountBalance(
                    account.id
                  );

                return [
                  account.id,
                  balance,
                ] as const;
              } catch {
                return [
                  account.id,
                  0,
                ] as const;
              }
            })
          );

        setBalances(
          Object.fromEntries(
            balanceEntries
          )
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your accounts."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [mounted, isAuthenticated]);

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

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

  const getAccountTypeLabel = (
    type: AccountType
  ) => {
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

        {/* NAVBAR */}

        <AppNavbar activePage="accounts" />

        {/* PAGE HEADER */}

        <header className="mb-7 mt-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              SpendWise
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Accounts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your accounts and keep
              track of their balances.
            </p>
          </div>

          {/* ADD ACCOUNT */}

          <button
            type="button"
            onClick={() =>
              router.push("/accounts/new")
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus
              size={17}
              strokeWidth={2.5}
            />

            <span className="hidden sm:inline">
              Add Account
            </span>

            <span className="sm:hidden">
              Add
            </span>
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="mt-8 h-8 w-40 rounded bg-slate-100" />
                </div>
              )
            )}
          </div>
        ) : accounts.length === 0 ? (
          <section className="rounded-3xl border border-slate-100 bg-white px-5 py-20 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <Wallet size={24} />
            </div>

            <h2 className="mt-5 text-base font-bold text-slate-900">
              No accounts yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add an account to start tracking
              your finances.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/accounts/new")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <Plus
                size={17}
                strokeWidth={2.5}
              />
              Add Account
            </button>
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {accounts.map((account) => {
              const Icon =
                getAccountIcon(
                  account.type
                );

              const balance =
                balances[account.id] ?? 0;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/accounts/${account.id}`
                    )
                  }
                  className="group w-full rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          {account.name}
                        </h2>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {getAccountTypeLabel(
                            account.type
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-300 transition group-hover:text-emerald-500">
                      View
                    </span>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs font-medium text-slate-400">
                      Current balance
                    </p>

                    <p
                      className={`mt-1 text-2xl font-bold tracking-tight ${
                        balance < 0
                          ? "text-red-500"
                          : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(
                        balance
                      )}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-400">
                      Opening balance
                    </span>

                    <span className="text-xs font-semibold text-slate-600">
                      {formatCurrency(
                        Number(
                          account.openingBalance
                        )
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}