'use client';
import { useState } from 'react';

export function PremiumUpgradeButton({ telegramId }: { telegramId: number }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // 1. Ask NestJS backend to construct the official checkout payload
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/payments/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, planType: 'pro_monthly' }),
      });
      const data = await res.json();

      if (data.invoiceLink && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        
        // 2. Open Telegram's native modal UI sheets inside the user container view
        tg.openInvoice(data.invoiceLink, (status: 'paid' | 'cancelled' | 'failed') => {
          if (status === 'paid') {
            tg.showAlert('🎉 Welcome to Pro! Your historical telemetry tracking logs have been provisioned.');
            window.location.reload();
          } else {
            tg.showAlert(`❌ Transaction update: Checkout completed with status code status: ${status}`);
          }
        });
      }
    } catch (err) {
      console.error('Payment checkout loop crashed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-neutral-950 font-bold rounded-xl text-xs shadow-lg transition disabled:opacity-50"
    >
      {loading ? 'Processing Window...' : '⭐ Upgrade to Pro (50 Stars / mo)'}
    </button>
  );
}
