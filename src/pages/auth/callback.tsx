import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { AuthCard, AuthShell } from '@/components/brand/AuthShell';
import Link from 'next/link';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        const { redirect } = router.query;

        if (data.session) {
          if (redirect && typeof redirect === 'string') {
            const isInternalRedirect = !redirect.startsWith('http://') && !redirect.startsWith('https://');
            const isProduction = process.env.NODE_ENV === 'production';
            const isLocalhostRedirect = redirect.includes('localhost') || redirect.includes('127.0.0.1');

            if (isInternalRedirect && !(isProduction && isLocalhostRedirect)) {
              router.push(redirect);
              return;
            }
          }

          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router.isReady, router]);

  if (loading) {
    return (
      <AuthShell title="Authenticating... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Authenticating</h1>
          <p className="text-sm text-neutral-400">Please wait while we sign you in.</p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (error) {
    return (
      <AuthShell title="Authentication Error | Turbo">
        <AuthCard className="text-center">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-red-400 mb-2">Authentication Error</h1>
          <p className="text-sm text-neutral-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-medium transition-all duration-200 active:scale-[0.97] shadow-lg shadow-orange-500/20"
          >
            Go Home
          </Link>
        </AuthCard>
      </AuthShell>
    );
  }

  return null;
}
