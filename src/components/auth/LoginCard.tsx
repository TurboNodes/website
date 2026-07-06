import { AuthButtons } from "@/components/AuthButtons";
import { AuthCard } from "@/components/brand/AuthShell";

interface LoginCardProps {
  title?: string;
  description?: string;
  redirectTo?: string;
}

export function LoginCard({
  title = "Access your dashboard.",
  description = "Sign in to view your node stats, earnings, and withdraw funds.",
  redirectTo = "/dashboard",
}: LoginCardProps) {
  return (
    <AuthCard>
      <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
        // sign_in
      </p>
      <h1
        className="text-white leading-tight mb-3"
        style={{
          fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
          fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
        }}
      >
        {title}
      </h1>
      <p className="text-sm text-neutral-400 mb-8 leading-relaxed">{description}</p>
      <AuthButtons layout="column" redirectTo={redirectTo} />
    </AuthCard>
  );
}
