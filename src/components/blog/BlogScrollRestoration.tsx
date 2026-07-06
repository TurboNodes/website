import { useRouter } from "next/router";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

export function BlogScrollRestoration() {
  const router = useRouter();
  const isBlogRoute = router.pathname.startsWith("/blog");

  useScrollRestoration(isBlogRoute);

  return null;
}
