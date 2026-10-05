'use client';
import { useState, useEffect } from 'react';
import { createAuthClient } from "better-auth/react";

// 1. बेटर ऑथ का क्लाइंट इन्स्टेंस बनाएं
const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
});

export function GitHubConnect({ telegramId }: { telegramId: number }) {
  const [loading, setLoading] = useState(false);
  
  // 🚀 फिक्स: हुक को सीधे कंपोनेंट की बॉडी में सबसे ऊपर कॉल किया (नियमों के अनुसार)
  const { data: session, isPending } = authClient.useSession();

  // 2. जब सेशन डेटा लोड हो जाए, तो उसे सीधे NestJS बैकएंड पर सिंक करें
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
        callbackURL: "/dashboard" // लॉगिन पूरा होने पर डैशबोर्ड पर वापस आएं
      });
    } catch (err) {
      console.error("Authentication handshake crashed:", err);
    } finally {
      setLoading(false);
    }
  };

  // अगर अभी सेशन लोड हो रहा है तो लोडिंग स्टेट दिखाएं
  if (isPending) {
    return <div className="text-xs text-neutral-400">Checking session status...</div>;
  }

  // अगर यूजर पहले से लॉग इन है
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
