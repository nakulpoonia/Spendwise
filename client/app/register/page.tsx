"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { register } from "@/services/authService";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    /*
     * Name must contain only English alphabets and spaces.
     * Examples:
     * Nakul Poonia -> valid
     * Nakul123 -> invalid
     * Nakul@Poonia -> invalid
     */
    const namePattern =
      /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    if (!namePattern.test(trimmedName)) {
      setError(
        "Name can contain only alphabets and spaces."
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        name: trimmedName,
        email,
        password,
        currency,
      });

      router.push(
        `/verify-email?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`${jakarta.className} min-h-screen bg-[#F3FBF6]`}
    >
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
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#347957]">
                Start your financial journey
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#17352A] xl:text-6xl">
                Build better
                <span className="block text-[#3D9668]">
                  money habits.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#62796B]">
                Organize your accounts, track expenses, and create budgets
                that help you stay in control of your finances.
              </p>

              <div className="mt-8 grid max-w-md grid-cols-2 gap-4">
                <div className="rounded-3xl border border-[#CFE8D8] bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                  <p className="text-2xl font-semibold text-[#17352A]">
                    100%
                  </p>

                  <p className="mt-1 text-sm text-[#82978B]">
                    Personal control
                  </p>
                </div>

                <div className="rounded-3xl border border-[#CFE8D8] bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                  <p className="text-2xl font-semibold text-[#17352A]">
                    One
                  </p>

                  <p className="mt-1 text-sm text-[#82978B]">
                    Simple dashboard
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#82978B]">
              SpendWise · Personal Finance Tracker
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}

        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-6 sm:px-10">
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-6 flex justify-center lg:hidden">
              <Image
                src="/spendwise-logo.png"
                alt="SpendWise"
                width={250}
                height={80}
                className="h-auto w-[220px] object-contain"
                priority
              />
            </div>

            {/* REGISTER CARD */}

            <div className="rounded-[2rem] border border-[#E2EEE6] bg-white p-7 shadow-[0_24px_70px_-30px_rgba(30,70,45,0.18)]">

              <div className="mb-6">
                <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3D9668]">
                  Get started
                </p>

                <h2 className="text-[29px] font-semibold tracking-[-0.03em] text-[#17352A]">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#82978B]">
                  Start managing your finances with SpendWise.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* NAME */}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-[#30463A]"
                  >
                    Full name
                  </Label>

                  <Input
                    id="name"
                    type="text"
                    placeholder="Nakul Poonia"
                    value={name}
                    onChange={(event) => {
                      const filteredValue =
                        event.target.value
                          .replace(/[^A-Za-z ]/g, "")
                          .replace(/\s+/g, " ");

                      setName(filteredValue);
                    }}
                    pattern="[A-Za-z]+( [A-Za-z]+)*"
                    title="Name can contain only alphabets and spaces."
                    className="h-11 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 text-[#17352A] placeholder:text-[#A4B4AA] focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
                    required
                  />

                  <p className="text-xs text-[#9AA9A0]">
                    Use alphabets and spaces only.
                  </p>
                </div>

                {/* EMAIL */}

                <div className="space-y-1.5">
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
                    className="h-11 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 text-[#17352A] placeholder:text-[#A4B4AA] focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
                    required
                  />
                </div>

                {/* PASSWORD */}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-[#30463A]"
                  >
                    Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      className="h-11 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 pr-12 text-[#17352A] placeholder:text-[#A4B4AA] focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
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

                {/* CURRENCY */}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="currency"
                    className="text-sm font-medium text-[#30463A]"
                  >
                    Preferred currency
                  </Label>

                  <div className="relative">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(event) =>
                        setCurrency(
                          event.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-[#DCEBE1] bg-[#FAFDFC] px-4 pr-11 text-sm text-[#17352A] outline-none transition focus:border-[#74B98F] focus:ring-2 focus:ring-[#74B98F]/25"
                    >
                      <option value="INR">
                        INR — Indian Rupee
                      </option>

                      <option value="USD">
                        USD — US Dollar
                      </option>

                      <option value="EUR">
                        EUR — Euro
                      </option>

                      <option value="GBP">
                        GBP — British Pound
                      </option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <svg
                        className="h-4 w-4 text-[#6F8578]"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#3D9668] text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition-all hover:bg-[#347F58] hover:shadow-xl"
                  disabled={loading}
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </Button>
              </form>

              {/* LOGIN LINK */}

              <p className="mt-6 text-center text-sm text-[#82978B]">
                Already have an account?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-[#347F58] hover:text-[#286546] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}