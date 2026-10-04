export const API_URL = 'http://localhost:5000/api';

const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Verifica que esté en ejecución y que tengas conexión.';

/** Reads the `{ error }` message sent by the API, or builds a generic one. */
export async function extractError(response: Response): Promise<string> {
  try {
    const data: { error?: string } = await response.json();
    if (data && typeof data.error === 'string') {
      return data.error;
    }
  } catch {
    // The body was not JSON; fall through to the generic message.
  }
  return `Error del servidor (${response.status})`;
}

/** Converts any thrown value into a user-friendly message. */
export function getErrorMessage(err: unknown): string {
  // fetch() rejects with a TypeError on network failures (server down, offline).
  if (err instanceof TypeError) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Ocurrió un error inesperado';
}
