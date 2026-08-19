export type ApiError = {
  code: string;
  message: string;
  retryable: boolean;
  field?: string;
};

export type ApiEnvelope<T> =
  | { ok: true; data: T; requestId: string }
  | { ok: false; error: ApiError; requestId: string };

export function apiSuccess<T>(data: T, requestId: string): ApiEnvelope<T> {
  return { ok: true, data, requestId };
}

export function apiFailure(
  error: ApiError,
  requestId: string,
): ApiEnvelope<never> {
  return { ok: false, error, requestId };
}
