import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCultivos } from '../useCultivos';
import { fetchCultivos } from '../../services/cultivosService';
import type { Cultivo } from '../../types/cultivo';

vi.mock('../../services/cultivosService');
const mockedFetch = vi.mocked(fetchCultivos);

const CULTIVOS: Cultivo[] = [
  { id: 'c-001', nombre: 'Café Castillo', variedad: 'Castillo', lote: '1', hectareas: 2.5, estado: 'sano', fechaSiembra: '2024-03-12' },
  { id: 'c-002', nombre: 'Maíz amarillo', variedad: 'ICA V-305', lote: '4', hectareas: 1.2, estado: 'atencion', fechaSiembra: '2025-08-02' },
];

/** Promesa controlable desde el test para simular peticiones "en vuelo". */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  mockedFetch.mockReset();
});

describe('useCultivos · conmutación de estados', () => {
  it('arranca en loading y pasa a success con los datos', async () => {
    const request = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(request.promise);

    const { result } = renderHook(() => useCultivos());
    expect(result.current.status).toBe('loading');
    expect(result.current.items).toEqual([]);

    await act(async () => request.resolve(CULTIVOS));

    expect(result.current.status).toBe('success');
    expect(result.current.items).toEqual(CULTIVOS);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('pasa a error con el mensaje del servicio si la carga inicial falla', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Sin conexión con el servidor.'));

    const { result } = renderHook(() => useCultivos());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toBe('Sin conexión con el servidor.');
    expect(result.current.items).toEqual([]);
  });

  it('usa un mensaje por defecto si se rechaza con algo que no es Error', async () => {
    mockedFetch.mockRejectedValueOnce('fallo-crudo');

    const { result } = renderHook(() => useCultivos());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toBe('No pudimos cargar tus cultivos.');
  });

  it('retry() recorre error → loading → success', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Falló'));
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('error'));

    const second = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(second.promise);

    let retryPromise!: Promise<void>;
    act(() => {
      retryPromise = result.current.retry();
    });
    expect(result.current.status).toBe('loading');

    await act(async () => {
      second.resolve(CULTIVOS);
      await retryPromise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.items).toEqual(CULTIVOS);
    expect(result.current.errorMessage).toBeUndefined();
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});

describe('useCultivos · guardia inFlight', () => {
  it('ignora retry() y refresh() mientras hay una petición en curso', async () => {
    const request = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(request.promise);

    const { result } = renderHook(() => useCultivos());
    expect(mockedFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
      await result.current.refresh();
      await result.current.retry();
    });
    expect(mockedFetch).toHaveBeenCalledTimes(1); // ninguna petición duplicada

    await act(async () => request.resolve(CULTIVOS));
    expect(result.current.status).toBe('success');
  });

  it('libera la guardia al terminar y permite una nueva petición', async () => {
    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('success'));

    mockedFetch.mockResolvedValueOnce([CULTIVOS[0]]);
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(result.current.items).toEqual([CULTIVOS[0]]);
  });

  it('libera la guardia aunque la petición falle', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Falló'));
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('error'));

    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });
});

describe('useCultivos · refreshError (pull-to-refresh)', () => {
  it('conserva los datos y expone refreshError si el refresco falla con datos previos', async () => {
    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('success'));

    mockedFetch.mockRejectedValueOnce(new Error('Red inestable.'));
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('success'); // NO pasa a error
    expect(result.current.items).toEqual(CULTIVOS); // datos intactos
    expect(result.current.refreshError).toBe('Red inestable.');
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('dismissRefreshError() limpia el aviso', async () => {
    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('success'));

    mockedFetch.mockRejectedValueOnce(new Error('Red inestable.'));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.refreshError).toBeDefined();

    act(() => result.current.dismissRefreshError());
    expect(result.current.refreshError).toBeUndefined();
  });

  it('un refresco exitoso posterior borra el refreshError', async () => {
    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('success'));

    mockedFetch.mockRejectedValueOnce(new Error('Red inestable.'));
    await act(async () => {
      await result.current.refresh();
    });

    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.refreshError).toBeUndefined();
    expect(result.current.status).toBe('success');
  });

  it('un refresco silencioso fallido SIN datos previos sí pasa a error', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Falló la carga inicial'));
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('error'));

    mockedFetch.mockRejectedValueOnce(new Error('Falló el refresco'));
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Falló el refresco');
    expect(result.current.refreshError).toBeUndefined();
  });

  it('refresh() no pasa por loading (no reemplaza la lista por el skeleton)', async () => {
    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const { result } = renderHook(() => useCultivos());
    await waitFor(() => expect(result.current.status).toBe('success'));

    const request = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(request.promise);

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });
    expect(result.current.status).toBe('success');

    await act(async () => {
      request.resolve(CULTIVOS);
      await refreshPromise;
    });
  });
});

describe('useCultivos · desmontaje y StrictMode', () => {
  it('no lanza errores ni advertencias si se desmonta durante la petición', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const request = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(request.promise);

    const { unmount } = renderHook(() => useCultivos());
    unmount();

    await act(async () => request.resolve(CULTIVOS));

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('libera la guardia tras desmontar: un hook nuevo puede volver a pedir datos', async () => {
    const request = deferred<Cultivo[]>();
    mockedFetch.mockReturnValueOnce(request.promise);
    const first = renderHook(() => useCultivos());
    first.unmount();
    await act(async () => request.resolve(CULTIVOS));

    mockedFetch.mockResolvedValueOnce(CULTIVOS);
    const second = renderHook(() => useCultivos());
    await waitFor(() => expect(second.result.current.status).toBe('success'));
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  it('en StrictMode hace UNA sola petición y termina en success', async () => {
    mockedFetch.mockResolvedValue(CULTIVOS);

    // `reactStrictMode: true` provoca el ciclo mount → unmount → mount de React 18/19.
    // Sin `isMounted.current = true` en el efecto, el estado quedaría en 'loading' para siempre.
    const { result } = renderHook(() => useCultivos(), { reactStrictMode: true });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual(CULTIVOS);
  });
});
