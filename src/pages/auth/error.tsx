import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthCard, AuthShell } from '@/components/brand/AuthShell';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (errorCode: string | string[] | undefined) => {
    if (!errorCode || typeof errorCode !== 'string') {
      return 'An unknown error occurred during authentication.';
    }

    switch (errorCode) {
      case 'access_denied':
        return 'Access was denied. You may have cancelled the authentication process.';
      case 'server_error':
        return 'A server error occurred. Please try again later.';
      case 'temporarily_unavailable':
        return 'The authentication service is temporarily unavailable. Please try again later.';
      case 'invalid_request':
        return 'Invalid authentication request. Please try again.';
      case 'invalid_client':
        return 'Invalid client configuration. Please contact support.';
      case 'invalid_grant':
        return 'Invalid authentication grant. Please try again.';
      case 'unauthorized_client':
        return 'Unauthorized client. Please contact support.';
      case 'unsupported_grant_type':
        return 'Unsupported authentication method. Please contact support.';
      case 'invalid_scope':
        return 'Invalid authentication scope. Please contact support.';
      case 'missing_code':
        return 'Missing authentication code. Please try again.';
      case 'no_session':
        return 'Failed to create session. Please try again.';
      case 'unexpected_error':
        return 'An unexpected error occurred. Please try again.';
      default:
        return `Authentication error: ${errorCode}`;
    }
  };

  return (
    <AuthShell title="Authentication Error | Turbo">
      <AuthCard className="text-center">
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
          // auth_error
        </p>
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1
          className="text-white leading-tight mb-4"
          style={{
            fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          }}
        >
          Authentication failed.
        </h1>

        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          {getErrorMessage(error)}
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-medium transition-all duration-200 active:scale-[0.97] shadow-lg shadow-orange-500/20"
          >
            Try Again
          </Link>

          <Link
            href="/blog"
            className="block w-full px-6 py-2.5 rounded-full border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white text-sm font-medium transition-colors"
          >
            Learn More
          </Link>
        </div>

        <p className="text-xs text-neutral-600 mt-8">
          If this problem persists, please{' '}
          <a
            href="https://discord.gg/ZqdvQkSEc7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
          >
            contact support
          </a>
          .
        </p>
      </AuthCard>
    </AuthShell>
  );
}
