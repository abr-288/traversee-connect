/**
 * Helper to extract a clean, user-friendly error message from a Supabase
 * Edge Function invocation result.
 *
 * supabase.functions.invoke() returns a FunctionsHttpError whose response body
 * is hidden behind `context.response`. We read it so the real backend message
 * (e.g. "Service indisponible. Réessayez plus tard.") surfaces to the user
 * instead of the generic "Edge Function returned a non-2xx status code".
 */
export async function extractEdgeFunctionError(
  err: unknown,
  fallback = "Une erreur est survenue. Veuillez réessayer."
): Promise<string> {
  try {
    const anyErr = err as any;
    const response: Response | undefined = anyErr?.context?.response ?? anyErr?.response;
    if (response && typeof response.json === "function") {
      const body = await response.clone().json().catch(() => null);
      if (body) {
        return (
          body.message ||
          body.error ||
          body.error_description ||
          fallback
        );
      }
      const text = await response.clone().text().catch(() => "");
      if (text) return text;
    }
    if (err instanceof Error && err.message) return err.message;
  } catch {
    /* ignore */
  }
  return fallback;
}

/**
 * Check whether a successful edge-function payload actually represents a
 * failure (success === false, or an `error` field). Returns a message or null.
 */
export function getPayloadError(data: any): string | null {
  if (!data) return null;
  if (data.success === false) {
    return data.message || data.error || "Le service est temporairement indisponible.";
  }
  if (data.error && typeof data.error === "string") {
    return data.message || data.error;
  }
  return null;
}
