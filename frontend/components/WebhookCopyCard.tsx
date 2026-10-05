'use client';

interface WebhookCopyCardProps {
  endpointId: string;
}

export function WebhookCopyCard({ endpointId }: WebhookCopyCardProps) {
  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://devpulse.app'}/v1/webhooks/${endpointId}`;

  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;

      // 1. Trigger device haptic vibration feedback for a native app feel
      tg.HapticFeedback?.impactOccurred('success');

      // 2. Leverage modern clipboard API
      navigator.clipboard.writeText(webhookUrl)
        .then(() => {
          // 3. Show native Telegram custom modal banner notification
          tg.showPopup({
            title: 'URL Copied! 🚀',
            message: 'Paste this endpoint URL into your GitHub Repository Webhook configurations to track active telemetry payloads.',
            buttons: [{ type: 'ok' }]
          });
        })
        .catch((err) => {
          tg.showAlert('Failed to copy pipeline URL automatically.');
          console.error(err);
        });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Your Webhook URL</h2>
        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          readOnly 
          value={webhookUrl}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono text-neutral-300 focus:outline-none"
        />
        <button 
          onClick={copyToClipboard}
          className="px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium rounded-lg text-xs transition-all flex items-center shrink-0"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
