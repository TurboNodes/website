import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AuthCard, AuthShell } from '@/components/brand/AuthShell';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DesktopAuthError() {
  const router = useRouter();
  const [errorReason, setErrorReason] = useState<string>('');

  useEffect(() => {
    if (router.isReady) {
      setErrorReason((router.query.reason as string) || 'delivery_failed');
    }
  }, [router.isReady, router.query.reason]);

  const retryPairing = () => {
    router.push('/desktop-auth/check' + (router.query.port ? `?port=${router.query.port}` : ''));
  };

  const openDiscord = () => {
    window.open('https://discord.gg/ZqdvQkSEc7', '_blank');
  };

  const getErrorMessage = () => {
    switch (errorReason) {
      case 'delivery_failed':
        return {
          title: "Can't connect to your desktop app",
          description:
            "We couldn't deliver the authentication to your desktop application. Your login was successful, but the connection to your local app failed.",
        };
      case 'missing_port':
        return {
          title: 'Missing port parameter',
          description:
            'A port number is required to connect to your desktop application. Please initiate the pairing process from your desktop app.',
        };
      case 'not_authenticated':
        return {
          title: 'Authentication required',
          description:
            'You need to sign in first before connecting your desktop application.',
        };
      default:
        return {
          title: 'Something went wrong',
          description:
            'We encountered an issue while setting up your desktop app connection.',
        };
    }
  };

  const errorInfo = getErrorMessage();

  const troubleshooting = (() => {
    if (errorReason === 'delivery_failed') {
      return {
        title: 'Try these steps:',
        items: [
          'Make sure your Turbo Node is running on the same device',
          'Close and restart your desktop application completely',
          "Check that your firewall isn't blocking local connections",
        ],
        border: 'border-sky-500/30 bg-sky-500/5',
        titleColor: 'text-sky-300',
        textColor: 'text-neutral-400',
      };
    }
    if (errorReason === 'missing_port') {
      return {
        title: 'How to fix this:',
        items: [
          'Open your Turbo desktop application',
          'Look for a "Pair with web" or "Connect account" button',
          'Click it to get the proper authentication link with port',
        ],
        border: 'border-amber-500/30 bg-amber-500/5',
        titleColor: 'text-amber-300',
        textColor: 'text-neutral-400',
      };
    }
    return null;
  })();

  return (
    <AuthShell title="Desktop Auth Error | Turbo">
      <AuthCard>
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4 text-center">
          // pairing_error
        </p>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">{errorInfo.title}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">{errorInfo.description}</p>
        </div>

        {troubleshooting && (
          <div className={`rounded-xl border p-4 mb-6 ${troubleshooting.border}`}>
            <h3 className={`text-sm font-medium mb-3 ${troubleshooting.titleColor}`}>
              {troubleshooting.title}
            </h3>
            <ul className={`text-xs space-y-2 ${troubleshooting.textColor}`}>
              {troubleshooting.items.map((item, i) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="font-mono text-neutral-600">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errorReason === 'delivery_failed' && router.query.port && (
          <button
            onClick={retryPairing}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-medium transition-all duration-200 active:scale-[0.97] shadow-lg shadow-orange-500/20 mb-4"
          >
            <RefreshCw className="w-4 h-4" />
            Try Pairing Again
          </button>
        )}

        <p className="text-center text-xs text-neutral-600">
          Still having trouble?{' '}
          <button
            onClick={openDiscord}
            className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
          >
            Join our Discord
          </button>{' '}
          for help.
        </p>
      </AuthCard>
    </AuthShell>
  );
}
