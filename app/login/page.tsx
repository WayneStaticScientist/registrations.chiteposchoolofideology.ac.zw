"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      setError("Your session expired. Please sign in again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/login", { email, password });
      window.location.href = "/";
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-100 bg-white px-8 py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 p-2 ring-1 ring-primary/20">
          <Image
            alt="Chitepo School of Ideology"
            height={48}
            src="/apple-touch-icon.png"
            width={48}
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Registrations
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use your administrator credentials to continue.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 px-8 py-8">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 text-center text-sm font-medium text-secondary">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex h-96 w-full max-w-md items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
