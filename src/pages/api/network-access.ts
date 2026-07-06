import type { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000;

interface NetworkAccessPayload {
  name: string;
  email: string;
  company?: string;
  useCase: string;
  volume?: string;
  regions?: string;
  message?: string;
}

const MAX_FIELD = 500;
const MAX_MESSAGE = 2000;

function trim(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parseBody(body: unknown): NetworkAccessPayload | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const name = trim(data.name, 120);
  const email = trim(data.email, 254);
  const useCase = trim(data.useCase, MAX_FIELD);

  if (!name || !email || !useCase) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return {
    name,
    email,
    company: trim(data.company, 120) || undefined,
    useCase,
    volume: trim(data.volume, MAX_FIELD) || undefined,
    regions: trim(data.regions, MAX_FIELD) || undefined,
    message: trim(data.message, MAX_MESSAGE) || undefined,
  };
}

function field(name: string, value: string | undefined, inline = true) {
  if (!value) return null;
  return { name, value, inline };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not configured");
    return res.status(503).json({ error: "Form is temporarily unavailable" });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(
    `network-access:${ip}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );

  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSec));
    return res.status(429).json({
      error: "Too many submissions. Please try again later.",
    });
  }

  const payload = parseBody(req.body);
  if (!payload) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  const fields = [
    field("Name", payload.name),
    field("Email", payload.email),
    field("Company", payload.company),
    field("Use case", payload.useCase, false),
    field("Monthly volume", payload.volume),
    field("Target regions", payload.regions),
    field("Message", payload.message, false),
  ].filter(Boolean);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "Network Access inquiry",
            color: 0x1a4fd6,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, await response.text());
      return res.status(502).json({ error: "Failed to send inquiry" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Discord webhook error:", error);
    return res.status(502).json({ error: "Failed to send inquiry" });
  }
}
