"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { GitHubConnect } from "@/components/GitHubConnect";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"sandbox" | "tracker">("sandbox");
  const [payloads, setPayloads] = useState<any[]>([]);
  const [tgUser, setTgUser] = useState<any>(null);

  // टेलीग्राम SDK और वेबसॉकेट्स को इनिशियलाइज करें
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();

      // टेलीग्राम यूजर डेटा निकालें (लोकल टेस्ट के लिए फॉलबैक आईडी 123456789)
      const user = tg.initDataUnsafe?.user || {
        id: 123456789,
        username: "dev_tester",
      };
      setTgUser(user);

      // बैकएंड वेबसॉकेट गेटवे से कनेक्ट करें
      const socket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      );
      socket.emit("join-room", user.id);

      // लाइव पेलोड आने पर स्ट्रीम में जोड़ें
      socket.on("new-payload", (newLog) => {
        setPayloads((prev) => [newLog, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const currentTelegramId = tgUser?.id || 123456789;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">
            DevPulse Dashboard
          </h1>
          <p className="text-xs text-neutral-400">
            Welcome, @{tgUser?.username || "developer"}
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "sandbox" ? "bg-indigo-600 text-white" : "text-neutral-400"}`}
          >
            🎛️ Sandbox
          </button>
          <button
            onClick={() => setActiveTab("tracker")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "tracker" ? "bg-indigo-600 text-white" : "text-neutral-400"}`}
          >
            📊 Tracker
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === "sandbox" ? (
        <section className="space-y-4">
          {/* गिटहब इंटीग्रेशन कार्ड */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2 text-neutral-300">
              GitHub Connection
            </h2>
            <GitHubConnect telegramId={currentTelegramId} />
          </div>

          {/* वेबहुक यूआरएल डिस्प्ले */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Your Webhook URL</h2>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/webhooks/d3b07384-d113-4956-a5cc-9c7934297a56`}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-xs font-mono text-emerald-400 select-all focus:outline-none"
              />
            </div>
          </div>

          {/* लाइव स्ट्रीम */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Live Payload Stream
          </h3>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {payloads.length === 0 ? (
              <p className="text-sm text-neutral-500 italic text-center py-8">
                Awaiting incoming events...
              </p>
            ) : (
              payloads.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 font-mono text-xs"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {p.http_method}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(p.received_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-neutral-300 overflow-x-auto bg-neutral-950 p-2 rounded max-h-40">
                    {JSON.stringify(p.body, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {/* गिटहब स्ट्रीक ट्रैकर */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-6 text-center">
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-widest">
              Active Coding Streak
            </p>
            <h2 className="text-5xl font-black text-white my-2">🔥 12 Days</h2>
            <p className="text-xs text-neutral-400">
              Keep committing daily to hold your lead on the global grid.
            </p>
          </div>

          {/* लीडरबोर्ड */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h3 className="text-sm font-bold mb-4">Top Group Contributors</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: "alex_dev", streak: 45 },
                { rank: 2, name: "crypt0_wizard", streak: 32 },
                { rank: 3, name: "you", streak: 12 },
              ].map((user) => (
                <div
                  key={user.rank}
                  className="flex justify-between items-center text-sm border-b border-neutral-800/50 pb-2 last:border-none"
                >
                  <span className="text-neutral-400">
                    <span className="font-bold text-neutral-200 mr-2">
                      #{user.rank}
                    </span>{" "}
                    @{user.name}
                  </span>
                  <span className="font-semibold text-indigo-400">
                    {user.streak} days
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
