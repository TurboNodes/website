import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import styles from "./network-access.module.css";

const USE_CASE_OPTIONS = [
  "LLM / AI lab data ingestion",
  "Global real-time monitoring",
  "Market research",
  "Web scraping / automation",
  "Ad verification",
  "SEO monitoring",
  "QA / testing",
  "Other",
] as const;

const VOLUME_OPTIONS = [
  "Under 10 GB / month",
  "10–100 GB / month",
  "100 GB – 1 TB / month",
  "1 TB+ / month",
  "Not sure yet",
] as const;

type FormState = {
  name: string;
  email: string;
  company: string;
  useCase: string;
  volume: string;
  regions: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  useCase: "",
  volume: "",
  regions: "",
  message: "",
};

export function NetworkAccessForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/network-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong");
      }

      setStatus("success");
      setForm(INITIAL);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className={`${styles.card} rounded-2xl p-8 sm:p-10 text-center`}>
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#1a4fd6]/10 text-[#1a4fd6]">
          <Check className="size-6" />
        </div>
        <h3 className="mb-2 text-xl font-medium">Inquiry sent</h3>
        <p className="text-sm leading-relaxed text-[#5c6470]">
          We&apos;ll review your request and get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className={`${styles.ghostBtn} mt-6`}
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.card} rounded-2xl p-6 sm:p-8`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={styles.field}>
          <span className={styles.label}>Name *</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={styles.input}
            placeholder="Jane Smith"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Work email *</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={styles.input}
            placeholder="jane@company.com"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Company</span>
          <input
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className={styles.input}
            placeholder="Acme Inc."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Use case *</span>
          <select
            required
            value={form.useCase}
            onChange={(e) => update("useCase", e.target.value)}
            className={styles.input}
          >
            <option value="" disabled>
              Select a use case
            </option>
            {USE_CASE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Estimated volume</span>
          <select
            value={form.volume}
            onChange={(e) => update("volume", e.target.value)}
            className={styles.input}
          >
            <option value="" disabled>Select volume</option>
            {VOLUME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Target regions</span>
          <input
            type="text"
            value={form.regions}
            onChange={(e) => update("regions", e.target.value)}
            className={styles.input}
            placeholder="US, EU, APAC…"
          />
        </label>

        <label className={`${styles.field} sm:col-span-2`}>
          <span className={styles.label}>Additional details</span>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className={styles.textarea}
            placeholder="Traffic patterns, compliance needs, timeline…"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className={`${styles.primaryBtn} mt-6 w-full sm:w-auto`}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Submit inquiry
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
