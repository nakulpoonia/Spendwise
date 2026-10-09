"use client";

import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowRight,
  CalendarDays,
  Tags,
} from "lucide-react";

import AppNavbar from "../../components/AppNavbar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function BudgetPage() {
  const router = useRouter();

  return (
    <div
      className={`${plusJakartaSans.className} min-h-screen bg-[#f6fbf8]`}
    >
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">

        {/* NAVBAR */}

        <AppNavbar activePage="budget" />

        {/* HEADER */}

        <header className="mt-8 mb-8">
          <p className="text-sm font-medium text-emerald-600">
            Budget
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Manage your budget
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Choose how you want to control and track your
            spending.
          </p>
        </header>

        {/* OPTIONS */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* MONTHLY BUDGET */}

          <button
            type="button"
            onClick={() =>
              router.push("/budget/monthly")
            }
            className="group text-left"
          >
            <div className="h-full rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_8px_30px_rgba(16,185,129,0.05)] transition duration-200 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.10)] sm:p-8">

              <div className="flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CalendarDays size={25} />
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <ArrowRight size={18} />
                </div>

              </div>

              <h2 className="mt-7 text-xl font-bold text-slate-900">
                Monthly Budget
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set one overall spending limit for the
                month and track your total expenses against
                it.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Manage monthly budget
                <ArrowRight size={15} />
              </div>

            </div>
          </button>

          {/* CATEGORY BUDGETS */}

          <button
            type="button"
            onClick={() =>
              router.push("/budget/categories")
            }
            className="group text-left"
          >
            <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 group-hover:-translate-y-1 group-hover:border-emerald-100 group-hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">

              <div className="flex items-start justify-between">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Tags size={25} />
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <ArrowRight size={18} />
                </div>

              </div>

              <h2 className="mt-7 text-xl font-bold text-slate-900">
                Category Budgets
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set individual spending limits for categories
                such as Food, Shopping, Transport and
                Entertainment.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Manage category budgets
                <ArrowRight size={15} />
              </div>

            </div>
          </button>

        </section>

        {/* INFO */}

        <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">

          <p className="text-sm font-semibold text-slate-900">
            Which one should I use?
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use a Monthly Budget when you want to control
            your overall spending. Use Category Budgets when
            you want separate limits for specific types of
            expenses. You can use both together.
          </p>

        </section>

      </main>
    </div>
  );
}