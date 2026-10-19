/**
 * Describe a document as a one-line string for the document list.
 */
export type TextDoc = { type: "text"; body: string };
export type ImageDoc = { type: "image"; url: string; alt?: string };
export type Doc = TextDoc | ImageDoc;

export function describe(doc: Doc): string {
  const { type, body, url, alt } = doc as any;
  if (type === "text") return body;
  if (type === "image") return `${url} (${alt})`;
  return type;
}
