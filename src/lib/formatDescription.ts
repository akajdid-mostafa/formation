import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked'; // Use named import

export async function formatDescription(description: string): Promise<string> {
  const cleanDescription = DOMPurify.sanitize(description);
  return await marked(cleanDescription);
}