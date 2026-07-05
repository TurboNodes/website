import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { AuthButtons } from '@/components/AuthButtons';
import { AuthCard, AuthShell } from '@/components/brand/AuthShell';
import { Check, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DesktopAuthCheck() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'checking' | 'sending' | 'success' | 'error' | 'signup'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sendUIDToDesktopApp = async (uid: string, port: string) => {
    try {
      setStatus('sending');

      const response = await fetch(`http://localhost:${port}/auth-result`, {
        method: 'POST',
        body: uid,
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push(`/desktop-auth/success?delivered=true`);
        }, 2000);
      } else {
        throw new Error(`Desktop app responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send UID to desktop app:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setStatus('error');

      setTimeout(() => {
        router.push(`/desktop-auth/error?reason=delivery_failed&port=${encodeURIComponent(port)}`);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!loading && router.isReady) {
      const { port } = router.query;

      if (!port || typeof port !== 'string') {
        router.push('/desktop-auth/error?reason=missing_port');
        return;
      }

      if (isAuthenticated && user) {
        sendUIDToDesktopApp(user.id, port);
      } else {
        setStatus('signup');
        localStorage.setItem('desktop_auth_port', port);
      }
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user && status === 'signup') {
      const port = localStorage.getItem('desktop_auth_port');
      if (port) {
        localStorage.removeItem('desktop_auth_port');
        sendUIDToDesktopApp(user.id, port);
      } else {
        router.push(`/desktop-auth/success`);
      }
    }
  }, [isAuthenticated, user, status]);

  const statusDisplay = (() => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />,
          title: 'Checking Authentication',
          description: 'Verifying your login status for desktop app access…',
          iconBg: 'bg-orange-500/10 border-orange-500/30',
        };
      case 'sending':
        return {
          icon: <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />,
          title: 'Sending to Desktop App',
          description: 'Delivering your authentication details to the desktop application…',
          iconBg: 'bg-emerald-500/10 border-emerald-500/30',
        };
      case 'success':
        return {
          icon: <Check className="w-6 h-6 text-emerald-400" />,
          title: 'Success',
          description: 'Your UID has been successfully sent to the desktop app.',
          iconBg: 'bg-emerald-500/10 border-emerald-500/30',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-400" />,
          title: 'Delivery Failed',
          description: `Failed to pair desktop app: ${errorMessage}.`,
          iconBg: 'bg-red-500/10 border-red-500/30',
        };
      case 'signup':
        return {
          icon: <LogIn className="w-6 h-6 text-orange-400" />,
          title: 'Authentication Required',
          description: 'Sign in to connect your desktop application.',
          iconBg: 'bg-orange-500/10 border-orange-500/30',
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />,
          title: 'Processing',
          description: 'Processing your request…',
          iconBg: 'bg-orange-500/10 border-orange-500/30',
        };
    }
  })();

  return (
    <AuthShell title="Desktop Auth | Turbo">
      <AuthCard>
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4 text-center">
          // desktop_pairing
        </p>

        <div className="text-center mb-6">
          <div
            className={cn(
              'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border',
              statusDisplay.iconBg,
            )}
          >
            {statusDisplay.icon}
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">
            {statusDisplay.title}
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {statusDisplay.description}
          </p>
        </div>

        {status === 'signup' && (
          <div className="space-y-4">
            <AuthButtons layout="column" />
            <p className="text-[11px] text-neutral-600 text-center">
              After signing in, you&apos;ll be automatically connected to the desktop app.
            </p>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  );
}
