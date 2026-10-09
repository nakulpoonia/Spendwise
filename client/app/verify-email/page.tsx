"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

import { resendVerification, verifyEmail } from "@/services/authService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      setEmail(emailParam);
      setCountdown(60);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verifyEmail(email, otp);

      setSuccess("Email verified successfully.");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || countdown > 0) {
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendVerification(email);

      setSuccess(
        "A new verification code has been sent to your email."
      );

      setCountdown(60);
      setOtp("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main
      className={`${jakarta.className} flex min-h-screen items-center justify-center bg-[#F3FBF6] px-6 py-8`}
    >
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/spendwise-logo.png"
            alt="SpendWise"
            width={250}
            height={80}
            className="h-auto w-[220px] object-contain"
            priority
          />
        </div>

        {/* CARD */}
        <div className="rounded-[2rem] border border-[#E2EEE6] bg-white p-7 shadow-[0_24px_70px_-30px_rgba(30,70,45,0.18)] sm:p-10">

          <div className="mb-7 text-center">
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3D9668]">
              Verify your email
            </p>

            <h1 className="text-[29px] font-semibold tracking-[-0.03em] text-[#17352A]">
              Check your inbox
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#82978B]">
              We sent a verification code to your email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

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
                value={email}
                readOnly
                placeholder="you@example.com"
                className="h-11 rounded-xl border-[#DCEBE1] bg-[#F3F8F5] px-4 text-[#6F8177] focus-visible:border-[#DCEBE1] focus-visible:ring-0"
              />
            </div>

            {/* OTP */}
            <div className="space-y-1.5">
              <Label
                htmlFor="otp"
                className="text-sm font-medium text-[#30463A]"
              >
                Verification code
              </Label>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                className="h-12 rounded-xl border-[#DCEBE1] bg-[#FAFDFC] px-4 text-center text-lg font-semibold tracking-[0.35em] text-[#17352A] placeholder:text-[#A4B4AA] placeholder:tracking-normal focus-visible:border-[#74B98F] focus-visible:ring-[#74B98F]/25"
                required
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-xl border border-[#CFE8D8] bg-[#EAF7EF] px-4 py-3 text-sm text-[#347957]">
                {success}
              </div>
            )}

            {/* VERIFY */}
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#3D9668] text-sm font-semibold text-white shadow-lg shadow-[#3D9668]/20 transition-all hover:bg-[#347F58] hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify email"}
            </Button>

            {/* RESEND */}
            <div className="pt-1 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-[#82978B]">
                  Resend code in{" "}
                  <span className="font-semibold text-[#347F58]">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm font-semibold text-[#347F58] hover:text-[#286546] hover:underline disabled:opacity-50"
                >
                  {resending
                    ? "Sending..."
                    : "Resend verification code"}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#82978B]">
            Already verified?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#347F58] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}