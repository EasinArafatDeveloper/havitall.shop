/**
 * Safely serialize an object for embedding inside a <script type="application/ld+json"> tag.
 * Escapes '<' so a value like a product name containing "</script>" can't break out of the tag.
 */
export function toJsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
