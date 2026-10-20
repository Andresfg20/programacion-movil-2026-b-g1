import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCultivos } from '../services/cultivosService';
import type { Cultivo, ViewStatus } from '../types/cultivo';

type LoadMode = 'initial' | 'silent';

export interface UseCultivosResult {
  status: ViewStatus;
  items: Cultivo[];
  errorMessage?: string;
  /** Error de un pull-to-refresh cuando ya había datos: se muestra como aviso, no reemplaza la lista. */
  refreshError?: string;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  dismissRefreshError: () => void;
}

export function useCultivos(): UseCultivosResult {
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [items, setItems] = useState<Cultivo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [refreshError, setRefreshError] = useState<string>();

  const inFlight = useRef(false);
  const itemsRef = useRef<Cultivo[]>([]);

  const load = useCallback(async (mode: LoadMode) => {
    if (inFlight.current) return; // evita peticiones duplicadas (doble toque, StrictMode)
    inFlight.current = true;
    if (mode === 'initial') setStatus('loading');

    try {
      const data = await fetchCultivos();
      itemsRef.current = data;
      setItems(data);
      setErrorMessage(undefined);
      setRefreshError(undefined);
      setStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos cargar tus cultivos.';
      if (mode === 'silent' && itemsRef.current.length > 0) {
        setRefreshError(message); // conserva los datos visibles
      } else {
        setErrorMessage(message);
        setStatus('error');
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  return {
    status,
    items,
    errorMessage,
    refreshError,
    retry: () => load('initial'),
    refresh: () => load('silent'),
    dismissRefreshError: () => setRefreshError(undefined),
  };
}
