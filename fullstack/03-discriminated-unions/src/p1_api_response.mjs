/**
 * Summarize a payment API response as one line for the status panel.
 */
export function summarize(response) {
  if (response.status === "paid") return `paid ${response.id}`;
  if (response.status === "pending") return "pending action required";
  return `failed ${response.errorCode}`;
}
