/**
 * Describe a document as a one-line string for the document list.
 */
export function describe(doc) {
  const { type, body, url, alt } = doc;
  if (type === "text") return body;
  if (type === "image") return `${url} (${alt})`;
  return type;
}
