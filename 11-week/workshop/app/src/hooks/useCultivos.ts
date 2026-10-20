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
  const isMounted = useRef(true);

  // Debe declararse ANTES del efecto de carga. Se vuelve a poner en true al montar
  // para sobrevivir al ciclo mount → unmount → mount de React.StrictMode.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async (mode: LoadMode) => {
    if (inFlight.current) return; // evita peticiones duplicadas (doble toque, StrictMode)
    inFlight.current = true;
    if (mode === 'initial') setStatus('loading');

    try {
      const data = await fetchCultivos();
      if (!isMounted.current) return; // el componente se desmontó mientras esperaba
      itemsRef.current = data;
      setItems(data);
      setErrorMessage(undefined);
      setRefreshError(undefined);
      setStatus('success');
    } catch (error) {
      if (!isMounted.current) return;
      const message = error instanceof Error ? error.message : 'No pudimos cargar tus cultivos.';
      if (mode === 'silent' && itemsRef.current.length > 0) {
        setRefreshError(message); // conserva los datos visibles
      } else {
        setErrorMessage(message);
        setStatus('error');
      }
    } finally {
      inFlight.current = false; // siempre se libera, incluso tras desmontar
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
