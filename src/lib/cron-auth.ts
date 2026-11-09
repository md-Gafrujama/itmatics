import "server-only";

export function isCronSecretConfigured(): boolean {
  return Boolean(process.env.CRON_SECRET?.trim());
}

/**
 * Comparing against a template string alone would accept "Bearer undefined"
 * whenever CRON_SECRET is unset, so an unconfigured secret always fails.
 */
export function hasValidCronSecret(request: Request): boolean {
  if (!isCronSecretConfigured()) return false;
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}
