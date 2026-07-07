import type { NextApiRequest, NextApiResponse } from "next";
import { validateReferralCode } from "@/lib/referralValidation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const result = await validateReferralCode(code);

  return res.status(200).json(result);
}
