/**
 * Summarize a payment API response as one line for the status panel.
 */
export type PaymentResponse =
  | { status: "paid"; id: string }
  | { status: "pending" }
  | { status: "failed"; errorCode: string };

export function summarize(response: PaymentResponse): string {
  if (response.status === "paid") return `paid ${response.id}`;
  if (response.status === "pending") return "pending action required";
  return `failed ${(response as any).errorCode}`;
}
