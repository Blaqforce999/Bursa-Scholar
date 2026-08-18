export type ActionError = { code: string; message: string };

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

/** One deterministic result row returned by the Ask Bursa assistant — always
 *  a real, verified scholarship, never a generated one. */
export type AssistantResultRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  meta: string;
};

export type AssistantAnswer = {
  summary: string;
  results: AssistantResultRow[];
  verified: boolean;
};
