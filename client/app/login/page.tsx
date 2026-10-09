"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export default function LoginPage() {
  const router = useRouter();

  const { setAuthenticatedUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loginResponse = await login({
        email,
        password,
      });

      setAuthenticatedUser({
        id: loginResponse.id,
        name: loginResponse.name,
        email: loginResponse.email,
        currency: loginResponse.currency,
      });

      router.push("/onboarding");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3FBF6]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#E8F7EE] lg:flex">

          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#BFE8CE]/60 blur-3xl" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#9AD8B2]/30 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* LOGO */}
            <div>
              <Image
                src="/spendwise-logo.png"
                alt="SpendWise"
                width={320}
                height={100}
                className="h-auto w-[300px] object-contain"
                priority
              />
            </div>

            {/* HERO */}
            <div className="max-w-xl">

              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#347957]">
                Personal finance, simplified
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-[#17352A] xl:text-6xl">
                Take control of
                <span className="block text-[#3D9668]">
                  your money.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-[#62796B]">
                Track your spending, manage budgets, and understand
                where your money goes — all from one beautifully simple
                dashboard.
              </p>

              {/* BALANCE CARD */}
              <div className="mt-10 max-w-md rounded-3xl border border-[#CFE8D8] bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(35,100,65,0.25)] backdrop-blur-xl">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#82978B]">
                      Total balance
                    </p>

                    <p className="mt-1 text-3xl font-semibold tracking-tight text-[#17352A]">
                      ₹82,450
                    </p>
                  </div>

                  <div className="rounded-full bg-[#E7F7ED] px-3 py-1 text-xs font-semibold text-[#2F7D57]">
                    +12.8%
                  </div>
                </div>

                {/* CHART */}
                <div className="mt-7 flex h-20 items-end gap-2">
                  {[35, 50, 42, 62, 48, 70, 58, 78, 67, 88, 76, 95].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-full bg-[#79C696]"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-[#82978B]">
              SpendWise · Personal Finance Tracker
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section
          className={`${jakarta.className} flex items-center justify-center bg-white px-6 py-12 sm:px-10`}
        >
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <div className="mb-10 flex justify-center lg:hidden">
              <Image
                src="/spendwise-logo.png"
                alt="SpendWise"
                width={280}
                height={90}
                className="h-auto w-[240px] object-contain"
                priority
              />
            </div>

            {/* LOGIN CARD */}
            <div className="rounded-[2rem] border border-[#E2EEE6] bg-white p-7 shadow-[0_24px_80px_-30px_rgba(30,70,45,0.18)] sm:p-10">

              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold text-[#3D9668]">
                  Welcome back
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-[#17352A]">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#82978B]">
                  Enter your details to continue managing your finances.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-[#30463A]"
                  >
                    Email address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    className="h-12 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 text-[#17352A] placeholder:text-[#A4B4AA] focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-[#30463A]"
                    >
                      Password
                    </Label>

                    <span className="text-xs text-[#A0AEA5]">
                      Secure sign in
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      className="h-12 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 pr-12 text-[#17352A] placeholder:text-[#A4B4AA] focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#82978B] transition-colors hover:bg-[#EAF5EE] hover:text-[#347F58]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* BUTTON */}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#3D9668] text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition-all hover:bg-[#347F58] hover:shadow-xl hover:shadow-[#3D9668]/25"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>
              </form>

              {/* DIVIDER */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E8F0EB]" />

                <span className="text-xs font-medium text-[#A0AEA5]">
                  NEW TO SPENDWISE?
                </span>

                <div className="h-px flex-1 bg-[#E8F0EB]" />
              </div>

              {/* REGISTER */}
              <p className="text-center text-sm text-[#82978B]">
                Create your account{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#347F58] hover:text-[#286546] hover:underline"
                >
                  Get started
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-[#A0AEA5]">
              Your financial data is protected with secure
              authentication.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}