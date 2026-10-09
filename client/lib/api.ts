import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PUBLIC_AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
];

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some(
    (publicEndpoint) =>
      endpoint === publicEndpoint ||
      endpoint.startsWith(`${publicEndpoint}?`)
  );

  const token = isPublicAuthEndpoint ? null : getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const backendMessage =
      data?.message ||
      data?.error ||
      `HTTP ${response.status} ${response.statusText}`;

    throw new Error(
      `API Error: ${response.status} ${response.statusText}\n` +
      `Endpoint: ${endpoint}\n` +
      `Message: ${backendMessage}`
    );
  }

  return data;
}