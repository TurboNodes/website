import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AuthCard, AuthShell } from '@/components/brand/AuthShell';
import { Check, Loader2, Truck } from 'lucide-react';

export default function DesktopAuthSuccess() {
  const router = useRouter();
  const [delivered, setDelivered] = useState<boolean>(false);

  useEffect(() => {
    if (router.isReady) {
      const isDelivered = !!router.query.delivered;
      setDelivered(isDelivered);

      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [router.isReady, router.query.delivered, router]);

  return (
    <AuthShell title="Desktop Auth Success | Turbo">
      <AuthCard className="text-center">
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
          // pairing_success
        </p>

        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          {delivered ? (
            <Truck className="w-6 h-6 text-emerald-400" />
          ) : (
            <Check className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        <h1
          className="text-white leading-tight mb-3"
          style={{
            fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          }}
        >
          You&apos;re connected.
        </h1>

        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          {delivered
            ? 'Your authentication has been delivered to the desktop app.'
            : 'Your desktop application has been successfully authenticated.'}
        </p>

        {delivered && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 mb-4 text-left">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
              <Truck className="w-4 h-4" />
              Delivered to desktop app
            </div>
            <p className="text-xs text-neutral-400">
              Your authentication was automatically sent to your desktop application.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
          Redirecting to dashboard…
        </div>
      </AuthCard>
    </AuthShell>
  );
}
