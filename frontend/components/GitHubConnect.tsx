'use client';
import { useState, useEffect } from 'react';
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  basePath: "/api/auth"
});

export function GitHubConnect({ telegramId }: { telegramId: number }) {
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user && telegramId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/v1/users/sync-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          githubUsername: session.user.name || 'github_user',
          accessToken: 'proxied_via_better_auth', 
        }),
      }).catch((err) => console.error("Synchronization pipeline failed:", err));
    }
  }, [session, telegramId]);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard"
      });
    } catch (err) {
      console.error("Authentication handshake crashed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return <div className="text-xs text-neutral-400">Checking session status...</div>;
  }

  if (session?.user) {
    return (
      <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
        Linked to GitHub account: <span className="font-bold">@{session.user.name}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={loading}
      className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] text-neutral-950 font-semibold rounded-lg text-xs transition disabled:opacity-50"
    >
      {loading ? "Handshaking Secure Routes..." : "Link GitHub Profile (via Better Auth)"}
    </button>
  );
}
