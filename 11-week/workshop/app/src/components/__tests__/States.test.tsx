import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { IonContent } from '@ionic/react';
import CultivosList, { type CultivosListProps } from '../CultivosList';
import type { Cultivo } from '../../types/cultivo';

/**
 * Props con las que CultivosList renderiza IonRefresher.
 * Se mockea solo ese componente porque, en jsdom, el wrapper de Ionic 9 (basado en @lit/react)
 * no aplica `disabled` ni registra `onIonRefresh` de forma observable. Así el test valida
 * NUESTRO contrato (disabled mientras carga + complete() siempre) en Ionic 8 y 9.
 */
type RefresherProps = {
  disabled?: boolean;
  slot?: string;
  onIonRefresh?: (event: CustomEvent<{ complete: () => void }>) => void | Promise<void>;
};
let refresherProps: RefresherProps = {};

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ionic/react')>();
  return {
    ...actual,
    IonRefresher: (props: RefresherProps & { children?: React.ReactNode }) => {
      refresherProps = props;
      return <div data-testid="ion-refresher">{props.children}</div>;
    },
  };
});

const CULTIVOS: Cultivo[] = [
  { id: 'c-001', nombre: 'Café Castillo', variedad: 'Castillo', lote: '1', hectareas: 2.5, estado: 'sano', fechaSiembra: '2024-03-12' },
  { id: 'c-002', nombre: 'Maíz amarillo', variedad: 'ICA V-305', lote: '4', hectareas: 1.2, estado: 'atencion', fechaSiembra: '2025-08-02' },
  { id: 'c-003', nombre: 'Papa pastusa', variedad: 'Pastusa suprema', lote: '2', hectareas: 0.8, estado: 'cosecha', fechaSiembra: '2025-06-20' },
];

const buildProps = (overrides: Partial<CultivosListProps> = {}): CultivosListProps => ({
  status: 'success',
  items: [],
  onRetry: vi.fn(),
  onRefresh: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const ui = (props: CultivosListProps) => (
  <IonContent>
    <CultivosList {...props} />
  </IonContent>
);

describe('CultivosList · estado de carga', () => {
  it('muestra skeletons y oculta datos, vacío y error', () => {
    render(ui(buildProps({ status: 'loading' })));

    expect(screen.getByTestId('state-loading')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByTestId('cultivo-skeleton')).toHaveLength(6);
    expect(screen.getByText('Cargando cultivos…')).toBeInTheDocument();

    expect(screen.queryByTestId('state-data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('state-empty')).not.toBeInTheDocument();
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
  });

  it('desactiva el pull-to-refresh mientras carga', () => {
    render(ui(buildProps({ status: 'loading' })));
    expect(screen.getByTestId('ion-refresher')).toBeInTheDocument();
    expect(refresherProps.slot).toBe('fixed');
    expect(refresherProps.disabled).toBe(true);
  });

  it('habilita el pull-to-refresh cuando ya hay datos', () => {
    render(ui(buildProps({ items: CULTIVOS })));
    expect(refresherProps.disabled).toBe(false);
  });
});

describe('CultivosList · estado de datos', () => {
  it('renderiza un ítem por cultivo con su estado en texto', () => {
    render(ui(buildProps({ items: CULTIVOS })));

    expect(screen.getByTestId('state-data')).toBeInTheDocument();
    expect(screen.getAllByTestId('cultivo-item')).toHaveLength(3);
    expect(screen.getByText('Café Castillo')).toBeInTheDocument();
    expect(screen.getByText('Maíz amarillo')).toBeInTheDocument();
    expect(screen.getByText('Sano')).toBeInTheDocument();
    expect(screen.getByText('Requiere atención')).toBeInTheDocument();
    expect(screen.getByText('Listo para cosechar')).toBeInTheDocument();
    expect(screen.queryByTestId('cultivo-skeleton')).not.toBeInTheDocument();
  });

  it('llama a onSelect con el cultivo tocado', () => {
    const onSelect = vi.fn();
    render(ui(buildProps({ items: CULTIVOS, onSelect })));

    fireEvent.click(screen.getAllByTestId('cultivo-item')[1]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(CULTIVOS[1]);
  });
});

describe('CultivosList · estado vacío', () => {
  it('muestra el mensaje vacío y permite actualizar', () => {
    const onRetry = vi.fn();
    render(ui(buildProps({ items: [], onRetry })));

    expect(screen.getByTestId('state-empty')).toHaveAttribute('role', 'status');
    expect(screen.getByText('Aún no tienes cultivos')).toBeInTheDocument();
    expect(screen.queryByTestId('state-data')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('state-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ofrece "Registrar cultivo" solo si se pasa onCreate', () => {
    const onCreate = vi.fn();
    const { rerender } = render(ui(buildProps()));
    expect(screen.queryByTestId('state-create')).not.toBeInTheDocument();

    rerender(ui(buildProps({ onCreate })));
    fireEvent.click(screen.getByTestId('state-create'));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});

describe('CultivosList · estado de error', () => {
  it('muestra el mensaje de error con role="alert" y botón Reintentar', () => {
    const onRetry = vi.fn();
    render(ui(buildProps({ status: 'error', errorMessage: 'Sin conexión con el servidor.', onRetry })));

    expect(screen.getByTestId('state-error')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('No pudimos cargar tus cultivos')).toBeInTheDocument();
    expect(screen.getByText('Sin conexión con el servidor.')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('state-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('usa un mensaje por defecto si no llega errorMessage', () => {
    render(ui(buildProps({ status: 'error' })));
    expect(screen.getByText('Revisa tu conexión e inténtalo de nuevo.')).toBeInTheDocument();
  });
});

describe('CultivosList · conmutación entre estados', () => {
  it('pasa de carga → datos → error → carga sin restos de la vista anterior', () => {
    const { rerender } = render(ui(buildProps({ status: 'loading' })));
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();

    rerender(ui(buildProps({ status: 'success', items: CULTIVOS })));
    expect(screen.queryByTestId('state-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('state-data')).toBeInTheDocument();

    rerender(ui(buildProps({ status: 'error', errorMessage: 'Falló la red.' })));
    expect(screen.queryByTestId('state-data')).not.toBeInTheDocument();
    expect(screen.getByTestId('state-error')).toBeInTheDocument();

    rerender(ui(buildProps({ status: 'loading' })));
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
  });
});

describe('CultivosList · pull-to-refresh', () => {
  it('ejecuta onRefresh y completa el refresher al terminar', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    render(ui(buildProps({ items: CULTIVOS, onRefresh })));

    await refresherProps.onIonRefresh!(new CustomEvent('ionRefresh', { detail: { complete } }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('completa el refresher incluso si onRefresh falla', async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('boom'));
    const complete = vi.fn();
    render(ui(buildProps({ items: CULTIVOS, onRefresh })));

    await refresherProps.onIonRefresh!(new CustomEvent('ionRefresh', { detail: { complete } }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });
});
