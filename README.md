This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# WalletConnect (optional) — enables the WalletConnect payout wallet connector.
# Obtain a project ID from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# GitHub — required for client downloads from TurboNodes/client-node Actions artifacts.
# Create a fine-grained or classic token with `actions:read` on that repository.
GITHUB_TOKEN=your-github-token
```

If `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is omitted, browser-injected wallets (e.g. MetaMask) still work; only the WalletConnect option is hidden.

## Referral system

Apply the Supabase migrations before using referrals:

```bash
# Run in the Supabase SQL editor (in order):
# 1. supabase/migrations/001_referrals.sql
# 2. supabase/migrations/002_restore_grants.sql
# 3. supabase/migrations/003_commission_only_new_users.sql
# 4. supabase/migrations/004_node_earnings_only_commission.sql
```

Migration `004_node_earnings_only_commission.sql` ensures commissions are calculated from **node operator earnings only** — referral balance and non-date `dailyEarnings` entries never count.

Referral rewards: **10% lifetime commission** on referred users' **node operator earnings** only. Referral income a user receives from their own referrals is never commissionable for their referrer. Commissions are calculated automatically via database triggers when node earnings update. Only **new signups** can be attributed via a referral link.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
