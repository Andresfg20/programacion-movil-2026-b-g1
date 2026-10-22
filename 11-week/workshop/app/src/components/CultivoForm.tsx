import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  saveOutline,
} from 'ionicons/icons';
import type { CultivoEstado } from '../types/cultivo';
import './CultivoForm.css';

export const CULTIVO_TIPOS = [
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'frutal', label: 'Frutal' },
  { value: 'cereal', label: 'Cereal' },
  { value: 'legumbre', label: 'Legumbre' },
] as const;

export type CultivoTipo = (typeof CULTIVO_TIPOS)[number]['value'];

const CULTIVO_ESTADOS: ReadonlyArray<{ value: CultivoEstado; label: string }> = [
  { value: 'sano', label: 'Sano' },
  { value: 'atencion', label: 'Requiere atención' },
  { value: 'cosecha', label: 'Listo para cosechar' },
];

export interface CultivoFormValues {
  nombre: string;
  tipo: CultivoTipo | '';
  fechaSiembra: string;
  ubicacion: string;
  estado: CultivoEstado;
}

export type CultivoFormSubmitValues = Omit<CultivoFormValues, 'tipo'> & { tipo: CultivoTipo };
export type CultivoFormField = 'nombre' | 'tipo' | 'fechaSiembra';
export type CultivoFormErrors = Partial<Record<CultivoFormField, string>>;

export const NOMBRE_MIN_LENGTH = 3;
export const MIN_FECHA_SIEMBRA = '1900-01-01';

const EMPTY_VALUES: CultivoFormValues = {
  nombre: '',
  tipo: '',
  fechaSiembra: '',
  ubicacion: '',
  estado: 'sano',
};

export const todayISO = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isValidISODate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

const isCultivoTipo = (value: unknown): value is CultivoTipo =>
  CULTIVO_TIPOS.some((tipo) => tipo.value === value);

const isCultivoEstado = (value: unknown): value is CultivoEstado =>
  CULTIVO_ESTADOS.some((estado) => estado.value === value);

export type CultivoFormParseResult =
  | { ok: true; data: CultivoFormSubmitValues }
  | { ok: false; errors: CultivoFormErrors };

export const parseCultivoForm = (
  values: CultivoFormValues,
  today: string = todayISO(),
): CultivoFormParseResult => {
  const errors: CultivoFormErrors = {};
  const nombre = values.nombre.trim();

  if (nombre.length === 0) {
    errors.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length < NOMBRE_MIN_LENGTH) {
    errors.nombre = `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres.`;
  }

  if (!isCultivoTipo(values.tipo)) {
    errors.tipo = 'Selecciona el tipo de cultivo.';
  }

  if (values.fechaSiembra === '') {
    errors.fechaSiembra = 'La fecha de siembra es obligatoria.';
  } else if (!isValidISODate(values.fechaSiembra) || values.fechaSiembra < MIN_FECHA_SIEMBRA) {
    errors.fechaSiembra = 'Ingresa una fecha válida.';
  } else if (values.fechaSiembra > today) {
    errors.fechaSiembra = 'La fecha de siembra no puede ser futura.';
  }

  if (Object.keys(errors).length > 0 || !isCultivoTipo(values.tipo)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { ...values, nombre, tipo: values.tipo, ubicacion: values.ubicacion.trim() },
  };
};

export const validateCultivoForm = (
  values: CultivoFormValues,
  today: string = todayISO(),
): CultivoFormErrors => {
  const result = parseCultivoForm(values, today);
  return result.ok ? {} : result.errors;
};

const sameValues = (a: CultivoFormValues, b: CultivoFormValues): boolean =>
  a.nombre === b.nombre &&
  a.tipo === b.tipo &&
  a.fechaSiembra === b.fechaSiembra &&
  a.ubicacion === b.ubicacion &&
  a.estado === b.estado;

const ERROR_IDS: Record<CultivoFormField, string> = {
  nombre: 'cultivo-form-nombre-error',
  tipo: 'cultivo-form-tipo-error',
  fechaSiembra: 'cultivo-form-fecha-error',
};

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} className="cultivo-form__error" role="alert">
      <IonIcon icon={alertCircleOutline} aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;

export interface CultivoFormProps {
  mode?: 'create' | 'edit';
  initialValues?: Partial<CultivoFormValues>;
  onSubmit: (values: CultivoFormSubmitValues) => void | Promise<void>;
  onCancel: () => void;
}

const CultivoForm: React.FC<CultivoFormProps> = ({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [baseline, setBaseline] = useState<CultivoFormValues>(() => ({
    ...EMPTY_VALUES,
    ...initialValues,
  }));
  const [values, setValues] = useState<CultivoFormValues>(baseline);
  const [touched, setTouched] = useState<Partial<Record<CultivoFormField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const today = useMemo(() => todayISO(), []);
  const errors = useMemo(() => validateCultivoForm(values, today), [values, today]);
  const isValid = Object.keys(errors).length === 0;
  const isDirty = !sameValues(values, baseline);

  const visibleError = (field: CultivoFormField): string | undefined =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const setField = <K extends keyof CultivoFormValues>(field: K, value: CultivoFormValues[K]) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError(undefined);
  };

  const touch = (field: CultivoFormField) => {
    setTouched((previous) => (previous[field] ? previous : { ...previous, [field]: true }));
  };

  const ariaFor = (field: CultivoFormField) => ({
    'aria-required': 'true' as const,
    'aria-invalid': visibleError(field) ? ('true' as const) : ('false' as const),
    'aria-describedby': visibleError(field) ? ERROR_IDS[field] : undefined,
  });

  const itemClass = (field: CultivoFormField): string =>
    visibleError(field) ? 'cultivo-form__item cultivo-form__item--invalid' : 'cultivo-form__item';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const parsed = parseCultivoForm(values, today);
    if (!parsed.ok) {
      setSubmitAttempted(true);
      return;
    }

    setIsSaving(true);
    setSubmitError(undefined);
    try {
      await onSubmit(parsed.data);
      if (!isMounted.current) return;
      setToastOpen(true);
      if (mode === 'create') {
        setValues(EMPTY_VALUES);
        setBaseline(EMPTY_VALUES);
        setTouched({});
        setSubmitAttempted(false);
      } else {
        setValues(parsed.data);
        setBaseline(parsed.data);
      }
    } catch {
      if (isMounted.current) {
        setSubmitError('No pudimos guardar el cultivo. Inténtalo de nuevo.');
      }
    } finally {
      if (isMounted.current) setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      onCancel();
    }
  };

  return (
    <form
      className="cultivo-form"
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="cultivo-form-title"
      aria-busy={isSaving}
      data-testid="cultivo-form"
    >
      <h2 id="cultivo-form-title" className="cultivo-form__title">
        {mode === 'edit' ? 'Editar cultivo' : 'Nuevo cultivo'}
      </h2>
      <p className="cultivo-form__legend">Los campos marcados con * son obligatorios.</p>

      <div className="cultivo-form__field">
        <IonItem lines="none" className={itemClass('nombre')}>
          <IonInput
            label="Nombre del cultivo *"
            labelPlacement="stacked"
            name="nombre"
            type="text"
            value={values.nombre}
            placeholder="Ej. Café Castillo"
            maxlength={60}
            autocomplete="off"
            enterkeyhint="next"
            required
            disabled={isSaving}
            {...ariaFor('nombre')}
            onIonInput={(event) => setField('nombre', event.detail.value ?? '')}
            onIonBlur={() => touch('nombre')}
          />
        </IonItem>
        <FieldError id={ERROR_IDS.nombre} message={visibleError('nombre')} />
      </div>

      <div className="cultivo-form__grid">
        <div className="cultivo-form__field">
          <IonItem lines="none" className={itemClass('tipo')}>
            <IonSelect
              label="Tipo de cultivo *"
              labelPlacement="stacked"
              name="tipo"
              placeholder="Selecciona un tipo"
              interface="action-sheet"
              cancelText="Cancelar"
              value={values.tipo === '' ? undefined : values.tipo}
              disabled={isSaving}
              {...ariaFor('tipo')}
              onIonChange={(event) => {
                const selected: unknown = event.detail.value;
                setField('tipo', isCultivoTipo(selected) ? selected : '');
                touch('tipo');
              }}
              onIonBlur={() => touch('tipo')}
              onIonDismiss={() => touch('tipo')}
            >
              {CULTIVO_TIPOS.map((tipo) => (
                <IonSelectOption key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <FieldError id={ERROR_IDS.tipo} message={visibleError('tipo')} />
        </div>

        <div className="cultivo-form__field">
          <IonItem lines="none" className={itemClass('fechaSiembra')}>
            <IonInput
              label="Fecha de siembra *"
              labelPlacement="stacked"
              name="fechaSiembra"
              type="date"
              value={values.fechaSiembra}
              min={MIN_FECHA_SIEMBRA}
              max={today}
              required
              disabled={isSaving}
              {...ariaFor('fechaSiembra')}
              onIonInput={(event) => setField('fechaSiembra', event.detail.value ?? '')}
              onIonBlur={() => touch('fechaSiembra')}
            />
          </IonItem>
          <FieldError id={ERROR_IDS.fechaSiembra} message={visibleError('fechaSiembra')} />
        </div>
      </div>

      <div className="cultivo-form__grid">
        <div className="cultivo-form__field">
          <IonItem lines="none" className="cultivo-form__item">
            <IonInput
              label="Ubicación"
              labelPlacement="stacked"
              name="ubicacion"
              type="text"
              value={values.ubicacion}
              placeholder="Ej. Lote 4, vereda La Esperanza"
              helperText="Opcional. Lote, vereda o predio."
              maxlength={80}
              autocomplete="off"
              enterkeyhint="done"
              disabled={isSaving}
              onIonInput={(event) => setField('ubicacion', event.detail.value ?? '')}
            />
          </IonItem>
        </div>

        <div className="cultivo-form__field">
          <IonItem lines="none" className="cultivo-form__item">
            <IonSelect
              label="Estado del cultivo"
              labelPlacement="stacked"
              name="estado"
              interface="action-sheet"
              cancelText="Cancelar"
              value={values.estado}
              disabled={isSaving}
              onIonChange={(event) => {
                const selected: unknown = event.detail.value;
                if (isCultivoEstado(selected)) setField('estado', selected);
              }}
            >
              {CULTIVO_ESTADOS.map((estado) => (
                <IonSelectOption key={estado.value} value={estado.value}>
                  {estado.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>
      </div>

      {submitError && (
        <p className="cultivo-form__error" role="alert" data-testid="cultivo-form-submit-error">
          <IonIcon icon={alertCircleOutline} aria-hidden="true" />
          <span>{submitError}</span>
        </p>
      )}

      {!isValid && !isSaving && (
        <p className="cultivo-form__hint" data-testid="cultivo-form-hint">
          Completa los campos obligatorios (*) para poder guardar.
        </p>
      )}

      <span className="sr-only" role="status">
        {isSaving ? 'Guardando cultivo…' : ''}
      </span>

      <div className="cultivo-form__actions">
        <IonButton
          type="submit"
          className="cultivo-form__button"
          disabled={!isValid || isSaving}
          data-testid="cultivo-form-submit"
        >
          {isSaving ? (
            <>
              <IonSpinner name="crescent" slot="start" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            <>
              <IonIcon slot="start" icon={saveOutline} aria-hidden="true" />
              {mode === 'edit' ? 'Guardar cambios' : 'Guardar cultivo'}
            </>
          )}
        </IonButton>
        <IonButton
          type="button"
          fill="outline"
          className="cultivo-form__button"
          disabled={isSaving}
          onClick={handleCancel}
          data-testid="cultivo-form-cancel"
        >
          <IonIcon slot="start" icon={closeOutline} aria-hidden="true" />
          Cancelar
        </IonButton>
      </div>

      <IonToast
        isOpen={toastOpen}
        message="Cultivo guardado correctamente."
        icon={checkmarkCircleOutline}
        duration={3000}
        position="bottom"
        cssClass="cultivo-toast-success"
        onDidDismiss={() => setToastOpen(false)}
      />

      <IonAlert
        isOpen={confirmOpen}
        header="¿Descartar cambios?"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        buttons={[
          { text: 'Seguir editando', role: 'cancel' },
          { text: 'Descartar cambios', role: 'destructive', handler: () => onCancel() },
        ]}
        onDidDismiss={() => setConfirmOpen(false)}
      />
    </form>
  );
};

export default CultivoForm;
