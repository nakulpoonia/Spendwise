"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Wallet,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getAccounts } from "../../services/accountService";
import {
  createOnboardingAccount,
  createOnboardingCategory,
} from "../../services/onboardingService";

import type {
  AccountSummary,
  AccountType,
} from "../../types/account";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

type OnboardingStep = 1 | 2 | 3 | 4;

type OnboardingAccountType =
  | "BANK"
  | "CASH"
  | "CREDIT_CARD"
  | "OTHER"
  | "SAVINGS"
  | "WALLET";

type OnboardingCategoryType = "INCOME" | "EXPENSE";

const ACCOUNT_TYPES: {
  value: OnboardingAccountType;
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

const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
];

const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Other Income",
];

export default function OnboardingPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [step, setStep] = useState<OnboardingStep>(1);

  const [checkingAccounts, setCheckingAccounts] =
    useState(true);

  const [existingAccounts, setExistingAccounts] = useState<
    AccountSummary[]
  >([]);

  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] =
    useState<OnboardingAccountType>("BANK");
  const [openingBalance, setOpeningBalance] = useState("");

  const [createdAccounts, setCreatedAccounts] = useState<
    AccountSummary[]
  >([]);

  const [selectedExpenseCategories, setSelectedExpenseCategories] =
    useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);

  const [selectedIncomeCategories, setSelectedIncomeCategories] =
    useState<string[]>(DEFAULT_INCOME_CATEGORIES);

  const [customExpenseCategory, setCustomExpenseCategory] =
    useState("");
  const [customIncomeCategory, setCustomIncomeCategory] =
    useState("");

  const [customExpenseCategories, setCustomExpenseCategories] =
    useState<string[]>([]);

  const [customIncomeCategories, setCustomIncomeCategories] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * CHECK WHETHER THIS IS A NEW USER
   */

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const checkAccounts = async () => {
      try {
        setCheckingAccounts(true);

        const accounts = await getAccounts();

        setExistingAccounts(accounts);

        if (accounts.length > 0) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        /*
         * Keep the user on onboarding.
         * If the account request fails, we do not
         * want to incorrectly send them to dashboard.
         */
      } finally {
        setCheckingAccounts(false);
      }
    };

    checkAccounts();
  }, [authLoading, isAuthenticated, router]);

  /*
   * AUTH LOADING
   */

  if (authLoading || checkingAccounts) {
    return (
      <main
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <div className="text-sm font-medium text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  /*
   * NOT AUTHENTICATED
   */

  if (!isAuthenticated) {
    return (
      <main
        className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[#f6fbf8]`}
      >
        <div className="text-sm font-medium text-slate-500">
          Redirecting...
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */

  const showError = (message: string) => {
    setError(message);
  };

  /*
   * ACCOUNT HELPERS
   */

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

  /*
   * ADD ACCOUNT
   */

  const handleAddAccount = async () => {
    setError("");

    const trimmedName = accountName.trim();

    if (!trimmedName) {
      showError("Please enter an account name.");
      return;
    }

    if (
      openingBalance === "" ||
      Number.isNaN(Number(openingBalance)) ||
      Number(openingBalance) < 0
    ) {
      showError("Opening balance must be 0 or greater.");
      return;
    }

    try {
      setLoading(true);

      const createdAccount =
        await createOnboardingAccount({
          name: trimmedName,
          type: accountType,
          openingBalance: Number(openingBalance),
        });

      setCreatedAccounts((current) => [
        ...current,
        createdAccount as AccountSummary,
      ]);

      setAccountName("");
      setAccountType("BANK");
      setOpeningBalance("");
      setError("");
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Unable to add account."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * REMOVE ACCOUNT FROM DISPLAY
   *
   * This only removes the newly-created account from the
   * onboarding display. It does not delete the database record.
   */

  const handleRemoveCreatedAccount = (accountId: number) => {
    setCreatedAccounts((current) =>
      current.filter((account) => account.id !== accountId)
    );
  };

  /*
   * CATEGORY HELPERS
   */

  const toggleExpenseCategory = (category: string) => {
    setSelectedExpenseCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const toggleIncomeCategory = (category: string) => {
    setSelectedIncomeCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const addCustomExpenseCategory = () => {
    const value = customExpenseCategory.trim();

    if (!value) {
      return;
    }

    const alreadyExists =
      DEFAULT_EXPENSE_CATEGORIES.includes(value) ||
      customExpenseCategories.includes(value);

    if (alreadyExists) {
      setCustomExpenseCategory("");
      return;
    }

    setCustomExpenseCategories((current) => [
      ...current,
      value,
    ]);

    setSelectedExpenseCategories((current) => [
      ...current,
      value,
    ]);

    setCustomExpenseCategory("");
  };

  const addCustomIncomeCategory = () => {
    const value = customIncomeCategory.trim();

    if (!value) {
      return;
    }

    const alreadyExists =
      DEFAULT_INCOME_CATEGORIES.includes(value) ||
      customIncomeCategories.includes(value);

    if (alreadyExists) {
      setCustomIncomeCategory("");
      return;
    }

    setCustomIncomeCategories((current) => [
      ...current,
      value,
    ]);

    setSelectedIncomeCategories((current) => [
      ...current,
      value,
    ]);

    setCustomIncomeCategory("");
  };

  /*
   * SAVE CATEGORIES
   */

  const handleFinishOnboarding = async () => {
    setError("");

    if (selectedExpenseCategories.length === 0) {
      showError(
        "Please select at least one expense category."
      );
      return;
    }

    if (selectedIncomeCategories.length === 0) {
      showError(
        "Please select at least one income category."
      );
      return;
    }

    try {
      setLoading(true);

      const expenseRequests =
        selectedExpenseCategories.map((name) =>
          createOnboardingCategory({
            name,
            type: "EXPENSE",
          })
        );

      const incomeRequests =
        selectedIncomeCategories.map((name) =>
          createOnboardingCategory({
            name,
            type: "INCOME",
          })
        );

      await Promise.all([
        ...expenseRequests,
        ...incomeRequests,
      ]);

      router.replace("/dashboard");
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Unable to finish setup."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * STEP NAVIGATION
   */

  const nextStep = () => {
    setError("");

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      const totalAccounts =
        existingAccounts.length +
        createdAccounts.length;

      if (totalAccounts === 0) {
        showError(
          "Please add at least one account before continuing."
        );
        return;
      }

      setStep(4);
    }
  };

  const previousStep = () => {
    setError("");

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 4) {
      setStep(3);
    }
  };

  /*
   * ACCOUNT COUNT
   */

  const totalAccountCount =
    existingAccounts.length + createdAccounts.length;

  /*
   * STEP LABEL
   */

  const stepLabels = [
    "Welcome",
    "Profile",
    "Accounts",
    "Categories",
  ];

  return (
    <main
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-8 sm:px-6 lg:px-8">
        <section className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
          {/* TOP */}

          <div className="border-b border-slate-100 px-6 py-6 sm:px-10">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  SpendWise
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Let&apos;s get you set up
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  A few quick steps before your dashboard is
                  ready.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-emerald-50 px-4 py-3 text-right sm:block">
                <p className="text-xs font-medium text-slate-400">
                  Step
                </p>

                <p className="mt-0.5 text-lg font-bold text-emerald-600">
                  {step} / 4
                </p>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mt-7">
              <div className="grid grid-cols-4 gap-2">
                {stepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const active = stepNumber <= step;

                  return (
                    <div key={label}>
                      <div
                        className={`h-1.5 rounded-full transition ${
                          active
                            ? "bg-emerald-500"
                            : "bg-slate-100"
                        }`}
                      />

                      <p
                        className={`mt-2 text-xs font-medium ${
                          active
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTENT */}

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* STEP 1 */}

            {step === 1 && (
              <div className="mx-auto max-w-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Wallet size={24} />
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Welcome to SpendWise
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Take control of your money.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                  We&apos;ll quickly set up your profile, accounts
                  and categories so your dashboard is ready to
                  use from day one.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-sm font-bold text-slate-900">
                      Accounts
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Add bank accounts, wallets, cards and cash.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-sm font-bold text-slate-900">
                      Categories
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Start with useful income and expense
                      categories.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-sm font-bold text-slate-900">
                      Dashboard
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      See your finances in one clean overview.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58]"
                  >
                    Get started
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <div className="mx-auto max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Profile
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Confirm your details
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  These details came from the account you just
                  created.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user?.name || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user?.email || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Currency
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user?.currency || "INR"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58]"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Accounts
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Add your accounts
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Add as many accounts as you use. You can always
                  add more later.
                </p>

                {/* EXISTING ACCOUNTS */}

                {existingAccounts.length > 0 && (
                  <div className="mt-7">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Existing accounts
                    </p>

                    <div className="space-y-3">
                      {existingAccounts.map((account) => {
                        const Icon = getAccountIcon(account.type);

                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-[#fbfdfc] px-4 py-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Icon size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {account.name}
                                </p>

                                <p className="mt-0.5 text-xs capitalize text-slate-400">
                                  {account.type
                                    .replace("_", " ")
                                    .toLowerCase()}
                                </p>
                              </div>
                            </div>

                            <Check
                              size={18}
                              className="text-emerald-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NEWLY CREATED ACCOUNTS */}

                {createdAccounts.length > 0 && (
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Added in this session
                      </p>

                      <span className="text-xs font-semibold text-emerald-600">
                        {totalAccountCount}{" "}
                        {totalAccountCount === 1
                          ? "account"
                          : "accounts"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {createdAccounts.map((account) => {
                        const Icon = getAccountIcon(account.type);

                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                <Icon size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {account.name}
                                </p>

                                <p className="mt-0.5 text-xs capitalize text-slate-400">
                                  {account.type
                                    .replace("_", " ")
                                    .toLowerCase()}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCreatedAccount(
                                  account.id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
                              aria-label={`Remove ${account.name} from the list`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ACCOUNT FORM */}

                <div className="mt-8 rounded-3xl border border-slate-100 bg-[#fbfdfc] p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {totalAccountCount > 0
                          ? "Add another account"
                          : "Add your first account"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You can repeat this as many times as needed.
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Plus size={18} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5">
                    <div>
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

                    <div>
                      <label
                        htmlFor="account-type"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Account type
                      </label>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {ACCOUNT_TYPES.map((option) => {
                          const selected =
                            accountType === option.value;

                          const Icon = getAccountIcon(
                            option.value
                          );

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setAccountType(option.value)
                              }
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

                              <p
                                className={`mt-3 text-sm font-semibold ${
                                  selected
                                    ? "text-emerald-700"
                                    : "text-slate-800"
                                }`}
                              >
                                {option.label}
                              </p>

                              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                                {option.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
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
                    </div>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddAccount}
                    disabled={loading}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {loading ? "Adding account..." : "Add account"}
                  </button>
                </div>

                {/* BOTTOM ACTIONS */}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={totalAccountCount === 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to categories
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}

            {step === 4 && (
              <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Categories
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Set up your categories
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Select the categories you want to start with.
                  You can add or edit them later.
                </p>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  {/* EXPENSE */}

                  <div className="rounded-3xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-slate-900">
                          Expense
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Where your money goes
                        </p>
                      </div>

                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                        {selectedExpenseCategories.length}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {[
                        ...DEFAULT_EXPENSE_CATEGORIES,
                        ...customExpenseCategories,
                      ].map((category) => {
                        const selected =
                          selectedExpenseCategories.includes(
                            category
                          );

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              toggleExpenseCategory(category)
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-100 bg-white"
                            }`}
                          >
                            <span
                              className={`text-sm font-medium ${
                                selected
                                  ? "text-emerald-700"
                                  : "text-slate-600"
                              }`}
                            >
                              {category}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                selected
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              {selected && <Check size={13} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <input
                        type="text"
                        value={customExpenseCategory}
                        onChange={(event) =>
                          setCustomExpenseCategory(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomExpenseCategory();
                          }
                        }}
                        placeholder="Add custom category"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-[#DCEBE1] bg-white px-3 text-sm outline-none focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                      />

                      <button
                        type="button"
                        onClick={addCustomExpenseCategory}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
                        aria-label="Add expense category"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* INCOME */}

                  <div className="rounded-3xl border border-slate-100 bg-[#fbfdfc] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-slate-900">
                          Income
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Where your money comes from
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {selectedIncomeCategories.length}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      {[
                        ...DEFAULT_INCOME_CATEGORIES,
                        ...customIncomeCategories,
                      ].map((category) => {
                        const selected =
                          selectedIncomeCategories.includes(
                            category
                          );

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              toggleIncomeCategory(category)
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-100 bg-white"
                            }`}
                          >
                            <span
                              className={`text-sm font-medium ${
                                selected
                                  ? "text-emerald-700"
                                  : "text-slate-600"
                              }`}
                            >
                              {category}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                selected
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              {selected && <Check size={13} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <input
                        type="text"
                        value={customIncomeCategory}
                        onChange={(event) =>
                          setCustomIncomeCategory(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomIncomeCategory();
                          }
                        }}
                        placeholder="Add custom category"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-[#DCEBE1] bg-white px-3 text-sm outline-none focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                      />

                      <button
                        type="button"
                        onClick={addCustomIncomeCategory}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
                        aria-label="Add income category"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3D9668] px-5 text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition hover:bg-[#347F58] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Finishing setup..."
                      : "Finish setup"}
                    {!loading && <Check size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}