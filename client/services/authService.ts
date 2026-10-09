import { apiFetch } from "../lib/api";
import { setAuth } from "../lib/auth";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });

  setAuth(response.token, {
    id: response.id,
    name: response.name,
    email: response.email,
    currency: response.currency,
  });

  return response;
}

export async function register(
  request: RegisterRequest
) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function verifyEmail(
  email: string,
  otp: string
) {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });
}
export async function resendVerification(email: string) {
  return apiFetch(
    `/api/auth/resend-verification?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
    }
  );
}