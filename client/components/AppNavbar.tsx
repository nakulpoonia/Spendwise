"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "../hooks/useAuth";

type ActivePage =
  | "dashboard"
  | "accounts"
  | "transactions"
  | "budget"
  | "profile"
  | "none";

interface AppNavbarProps {
  activePage: ActivePage;
}

export default function AppNavbar({
  activePage,
}: AppNavbarProps) {
  const router = useRouter();

  const { user } = useAuth();

  const profileInitial =
    user?.name?.charAt(0).toUpperCase() || "N";

  const navItemClasses = (page: ActivePage) => {
    if (activePage === page) {
      return "rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600";
    }

    return "rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900";
  };

  return (
    <nav className="relative rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-wrap items-center gap-4">

        {/* LOGO */}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="Go to dashboard"
        >
          <Image
            src="/spendwise-logo.png"
            alt="SpendWise"
            width={150}
            height={47}
            className="h-auto w-[125px] object-contain sm:w-[145px]"
            priority
          />
        </button>

        {/* NAVIGATION */}

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">

          {/* DASHBOARD */}

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className={navItemClasses("dashboard")}
          >
            Dashboard
          </button>

          {/* ACCOUNTS */}

          <button
            type="button"
            onClick={() => router.push("/accounts")}
            className={navItemClasses("accounts")}
          >
            Accounts
          </button>

          {/* TRANSACTIONS */}

          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className={navItemClasses("transactions")}
          >
            Transactions
          </button>

          {/* BUDGET */}

          <button
            type="button"
            onClick={() => router.push("/budget")}
            className={navItemClasses("budget")}
          >
            Budget
          </button>
        </div>

        {/* PROFILE */}

        <button
          type="button"
          onClick={() => router.push("/profile")}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
            activePage === "profile"
              ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
          aria-label="Go to profile"
          title="Profile"
        >
          {profileInitial}
        </button>
      </div>
    </nav>
  );
}