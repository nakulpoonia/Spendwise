import { Suspense } from "react";
import AccountDetailsClient from "./AccountDetailsClient";

export default function AccountDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 rounded bg-slate-200" />

            <div className="h-8 w-64 rounded bg-slate-200" />

            <div className="h-40 rounded-2xl bg-slate-100" />

            <div className="h-64 rounded-2xl bg-slate-100" />
          </div>
        </main>
      }
    >
      <AccountDetailsClient />
    </Suspense>
  );
}