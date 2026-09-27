/**
 * Backend API base URL (no trailing slash).
 * Set NEXT_PUBLIC_API_BASE in Vercel → Settings → Environment Variables.
 */
export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  return '';
}

export function isApiConfigured(): boolean {
  return getApiBase().length > 0;
}
