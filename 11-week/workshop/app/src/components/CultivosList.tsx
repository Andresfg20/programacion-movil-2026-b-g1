import React from 'react';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  leafOutline,
  nutritionOutline,
  warningOutline,
} from 'ionicons/icons';
import type { Cultivo, CultivoEstado, ViewStatus } from '../types/cultivo';
import './CultivosList.css';

export interface CultivosListProps {
  status: ViewStatus;
  items: Cultivo[];
  errorMessage?: string;
  onRetry: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onSelect?: (cultivo: Cultivo) => void;
  onCreate?: () => void;
}

const SKELETON_ROWS = 6;

const ESTADO_UI: Record<CultivoEstado, { label: string; icon: string }> = {
  sano: { label: 'Sano', icon: checkmarkCircleOutline },
  atencion: { label: 'Requiere atención', icon: warningOutline },
  cosecha: { label: 'Listo para cosechar', icon: nutritionOutline },
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const formatFecha = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

/* ----------------------------- Estado: carga ----------------------------- */
const LoadingState: React.FC = () => {
  const animated = !prefersReducedMotion();
  return (
    <IonList lines="none" className="cultivos-list" aria-busy="true" data-testid="state-loading">
      <span className="sr-only" role="status">
        Cargando cultivos…
      </span>
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <IonItem key={index} data-testid="cultivo-skeleton" aria-hidden="true">
          <IonLabel>
            <IonSkeletonText animated={animated} className="skeleton-title" />
            <IonSkeletonText animated={animated} className="skeleton-line" />
            <IonSkeletonText animated={animated} className="skeleton-line skeleton-line--short" />
          </IonLabel>
          <IonSkeletonText animated={animated} slot="end" className="skeleton-badge" />
        </IonItem>
      ))}
    </IonList>
  );
};

/* ------------------------ Estado: vacío / error -------------------------- */
interface StatePanelProps {
  variant: 'empty' | 'error';
  message?: string;
  onRetry: () => void | Promise<void>;
  onCreate?: () => void;
}

const StatePanel: React.FC<StatePanelProps> = ({ variant, message, onRetry, onCreate }) => {
  const isError = variant === 'error';
  return (
    <section
      className={`state-panel state-panel--${variant}`}
      role={isError ? 'alert' : 'status'}
      data-testid={isError ? 'state-error' : 'state-empty'}
    >
      <IonIcon
        className="state-panel__icon"
        icon={isError ? alertCircleOutline : leafOutline}
        aria-hidden="true"
      />
      <h2 className="state-panel__title">
        {isError ? 'No pudimos cargar tus cultivos' : 'Aún no tienes cultivos'}
      </h2>
      <p className="state-panel__text">
        {isError
          ? message ?? 'Revisa tu conexión e inténtalo de nuevo.'
          : 'Registra tu primer cultivo para seguir su estado y la fecha de cosecha.'}
      </p>
      <div className="state-panel__actions">
        {!isError && onCreate && (
          <IonButton className="state-action" onClick={onCreate} data-testid="state-create">
            Registrar cultivo
          </IonButton>
        )}
        <IonButton
          className="state-action"
          fill={!isError && onCreate ? 'outline' : 'solid'}
          onClick={() => void onRetry()}
          data-testid="state-retry"
        >
          {isError ? 'Reintentar' : 'Actualizar'}
        </IonButton>
      </div>
    </section>
  );
};

/* ------------------------------ Estado: datos ---------------------------- */
const DataState: React.FC<{ items: Cultivo[]; onSelect?: (c: Cultivo) => void }> = ({
  items,
  onSelect,
}) => (
  <IonList lines="none" className="cultivos-list" aria-label="Lista de cultivos" data-testid="state-data">
    {items.map((cultivo) => {
      const estado = ESTADO_UI[cultivo.estado];
      return (
        <IonItem
          key={cultivo.id}
          button={Boolean(onSelect)}
          detail={Boolean(onSelect)}
          onClick={() => onSelect?.(cultivo)}
          data-testid="cultivo-item"
        >
          <IonLabel>
            <h2>{cultivo.nombre}</h2>
            <p>
              {cultivo.variedad} · Lote {cultivo.lote} · {cultivo.hectareas.toLocaleString('es-CO')} ha
            </p>
            <p className="cultivo-meta">Sembrado el {formatFecha(cultivo.fechaSiembra)}</p>
          </IonLabel>
          <IonBadge slot="end" className={`estado-badge estado-badge--${cultivo.estado}`}>
            <IonIcon icon={estado.icon} aria-hidden="true" />
            {estado.label}
          </IonBadge>
        </IonItem>
      );
    })}
  </IonList>
);

/* --------------------------- Componente principal ------------------------ */
/**
 * Debe renderizarse dentro de <IonContent> para que IonRefresher (slot="fixed") funcione.
 */
const CultivosList: React.FC<CultivosListProps> = ({
  status,
  items,
  errorMessage,
  onRetry,
  onRefresh,
  onSelect,
  onCreate,
}) => {
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await onRefresh();
    } catch {
      // El error lo gestiona quien provee onRefresh (p. ej. useCultivos); aquí solo
      // garantizamos que el spinner del refresher siempre se cierre.
    } finally {
      event.detail.complete();
    }
  };

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh} disabled={status === 'loading'}>
        <IonRefresherContent pullingText="Desliza para actualizar" refreshingText="Actualizando…" />
      </IonRefresher>

      <div className="cultivos-container">
        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <StatePanel variant="error" message={errorMessage} onRetry={onRetry} />
        )}

        {status === 'success' && items.length === 0 && (
          <StatePanel variant="empty" onRetry={onRetry} onCreate={onCreate} />
        )}

        {status === 'success' && items.length > 0 && <DataState items={items} onSelect={onSelect} />}
      </div>
    </>
  );
};

export default CultivosList;
