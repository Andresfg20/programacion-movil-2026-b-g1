import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CultivoForm, {
  parseCultivoForm,
  todayISO,
  validateCultivoForm,
  type CultivoFormProps,
  type CultivoFormValues,
} from '../CultivoForm';

interface MockInputProps {
  label?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  min?: string | number;
  max?: string | number;
  maxlength?: number;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-required'?: 'true' | 'false';
  'aria-invalid'?: 'true' | 'false';
  'aria-describedby'?: string;
  onIonInput?: (event: { detail: { value?: string | null } }) => void;
  onIonBlur?: () => void;
}

interface MockSelectProps {
  label?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  'aria-required'?: 'true' | 'false';
  'aria-invalid'?: 'true' | 'false';
  'aria-describedby'?: string;
  onIonChange?: (event: { detail: { value?: string } }) => void;
  onIonBlur?: () => void;
  onIonDismiss?: () => void;
}

interface MockAlertProps {
  isOpen?: boolean;
  header?: string;
  message?: string;
  buttons?: Array<{ text: string; handler?: () => void }>;
  onDidDismiss?: () => void;
}

interface MockToastProps {
  isOpen?: boolean;
  message?: string;
  cssClass?: string;
}

/**
 * En jsdom el wrapper de Ionic 9 no aplica `value`/`label` ni conecta `onIonInput`,
 * `onIonChange`, `onIonBlur`. Se sustituyen solo estos componentes por equivalentes
 * nativos con el mismo contrato de props; IonItem, IonButton, IonIcon e IonSpinner son reales.
 */
vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ionic/react')>();

  const IonInput = (props: MockInputProps) => (
    <label>
      <span>{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? 'text'}
        value={props.value ?? ''}
        placeholder={props.placeholder}
        min={props.min}
        max={props.max}
        maxLength={props.maxlength}
        disabled={props.disabled}
        aria-required={props['aria-required']}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        onChange={(event) => props.onIonInput?.({ detail: { value: event.target.value } })}
        onBlur={() => props.onIonBlur?.()}
      />
      {props.helperText ? <small>{props.helperText}</small> : null}
    </label>
  );

  const IonSelect = (props: MockSelectProps) => (
    <label>
      <span>{props.label}</span>
      <select
        name={props.name}
        value={props.value ?? ''}
        disabled={props.disabled}
        aria-required={props['aria-required']}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        onChange={(event) => props.onIonChange?.({ detail: { value: event.target.value } })}
        onBlur={() => {
          props.onIonBlur?.();
          props.onIonDismiss?.();
        }}
      >
        {props.placeholder ? <option value="">{props.placeholder}</option> : null}
        {props.children}
      </select>
    </label>
  );

  const IonSelectOption = (props: { value: string; children?: React.ReactNode }) => (
    <option value={props.value}>{props.children}</option>
  );

  const IonAlert = (props: MockAlertProps) =>
    props.isOpen ? (
      <div role="alertdialog" aria-label={props.header} data-testid="ion-alert">
        <h2>{props.header}</h2>
        <p>{props.message}</p>
        {props.buttons?.map((button) => (
          <button
            key={button.text}
            type="button"
            onClick={() => {
              button.handler?.();
              props.onDidDismiss?.();
            }}
          >
            {button.text}
          </button>
        ))}
      </div>
    ) : null;

  const IonToast = (props: MockToastProps) =>
    props.isOpen ? (
      <div data-testid="ion-toast" className={props.cssClass}>
        {props.message}
      </div>
    ) : null;

  return { ...actual, IonInput, IonSelect, IonSelectOption, IonAlert, IonToast };
});

const VALID_FECHA = '2024-03-12';

const tomorrowISO = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return todayISO(date);
};

const EMPTY_VALUES: CultivoFormValues = {
  nombre: '',
  tipo: '',
  fechaSiembra: '',
  ubicacion: '',
  estado: 'sano',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const renderForm = (overrides: Partial<CultivoFormProps> = {}) => {
  const props: CultivoFormProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    ...overrides,
  };
  const user = userEvent.setup();
  const utils = render(<CultivoForm {...props} />);
  return { user, props, ...utils };
};

const field = {
  nombre: () => screen.getByLabelText(/Nombre del cultivo/),
  tipo: () => screen.getByLabelText(/Tipo de cultivo/),
  fecha: () => screen.getByLabelText(/Fecha de siembra/),
  ubicacion: () => screen.getByLabelText(/Ubicación/),
  estado: () => screen.getByLabelText(/Estado del cultivo/),
  submit: () => screen.getByTestId('cultivo-form-submit'),
  cancel: () => screen.getByTestId('cultivo-form-cancel'),
};

const expectSubmit = (state: 'disabled' | 'enabled') =>
  waitFor(() => {
    if (state === 'disabled') expect(field.submit()).toBeDisabled();
    else expect(field.submit()).toBeEnabled();
  });

const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field.nombre(), '  Café Castillo  ');
  await user.selectOptions(field.tipo(), 'frutal');
  fireEvent.change(field.fecha(), { target: { value: VALID_FECHA } });
  await user.type(field.ubicacion(), ' Lote 4 ');
};

let errorSpy: MockInstance;
let warnSpy: MockInstance;

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error');
  warnSpy = vi.spyOn(console, 'warn');
});

afterEach(() => {
  expect(errorSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

describe('CultivoForm · renderizado', () => {
  it('muestra todos los campos, los botones y las opciones de tipo', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Nuevo cultivo' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Nuevo cultivo' })).toBeInTheDocument();
    expect(field.nombre()).toBeInTheDocument();
    expect(field.tipo()).toBeInTheDocument();
    expect(field.fecha()).toHaveAttribute('type', 'date');
    expect(field.ubicacion()).toBeInTheDocument();
    expect(field.estado()).toHaveValue('sano');
    expect(field.submit()).toHaveTextContent('Guardar cultivo');
    expect(field.cancel()).toHaveTextContent('Cancelar');

    const opciones = Array.from(field.tipo().querySelectorAll('option')).map((o) => o.textContent);
    expect(opciones).toEqual(['Selecciona un tipo', 'Hortaliza', 'Frutal', 'Cereal', 'Legumbre']);
  });

  it('limita la fecha al día de hoy mediante el atributo max', () => {
    renderForm();
    expect(field.fecha()).toHaveAttribute('max', todayISO());
  });

  it('en modo edición precarga los valores y cambia los textos', () => {
    renderForm({
      mode: 'edit',
      initialValues: { nombre: 'Maíz amarillo', tipo: 'cereal', fechaSiembra: VALID_FECHA },
    });

    expect(screen.getByRole('heading', { name: 'Editar cultivo' })).toBeInTheDocument();
    expect(field.nombre()).toHaveValue('Maíz amarillo');
    expect(field.tipo()).toHaveValue('cereal');
    expect(field.fecha()).toHaveValue(VALID_FECHA);
    expect(field.submit()).toHaveTextContent('Guardar cambios');
    expect(field.submit()).toBeEnabled();
  });
});

describe('CultivoForm · mensajes de error', () => {
  it('no muestra errores antes de que el usuario interactúe', () => {
    renderForm();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(field.nombre()).toHaveAttribute('aria-invalid', 'false');
  });

  it('muestra los errores de campos vacíos al salir de cada uno', async () => {
    const { user } = renderForm();

    await user.click(field.nombre());
    await user.tab();
    await user.click(field.tipo());
    await user.tab();
    await user.click(field.fecha());
    await user.tab();

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el tipo de cultivo.')).toBeInTheDocument();
    expect(screen.getByText('La fecha de siembra es obligatoria.')).toBeInTheDocument();
    expect(field.nombre()).toHaveAttribute('aria-invalid', 'true');
    expect(field.tipo()).toHaveAttribute('aria-invalid', 'true');
    expect(field.fecha()).toHaveAttribute('aria-invalid', 'true');
    expect(field.nombre()).toHaveAttribute('aria-describedby', 'cultivo-form-nombre-error');
  });

  it('valida el nombre en tiempo real: mínimo 3 caracteres', async () => {
    const { user } = renderForm();

    await user.type(field.nombre(), 'ab');
    await user.tab();
    expect(screen.getByText('El nombre debe tener al menos 3 caracteres.')).toBeInTheDocument();

    await user.click(field.nombre());
    await user.type(field.nombre(), 'c');
    expect(screen.queryByText(/al menos 3 caracteres/)).not.toBeInTheDocument();
    expect(field.nombre()).toHaveAttribute('aria-invalid', 'false');
  });

  it('trata un nombre formado solo por espacios como vacío', async () => {
    const { user } = renderForm();
    await user.type(field.nombre(), '     ');
    await user.tab();
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
  });

  it('rechaza una fecha de siembra futura', async () => {
    const { user } = renderForm();
    await user.click(field.fecha());
    fireEvent.change(field.fecha(), { target: { value: tomorrowISO() } });
    await user.tab();
    expect(screen.getByText('La fecha de siembra no puede ser futura.')).toBeInTheDocument();
  });

  it('acepta la fecha de hoy', async () => {
    const { user } = renderForm();
    await user.click(field.fecha());
    fireEvent.change(field.fecha(), { target: { value: todayISO() } });
    await user.tab();
    expect(screen.queryByText(/fecha de siembra no puede ser futura/)).not.toBeInTheDocument();
    expect(field.fecha()).toHaveAttribute('aria-invalid', 'false');
  });

  it('muestra todos los errores al enviar con Enter si el formulario es inválido', () => {
    const { props } = renderForm();

    fireEvent.submit(screen.getByTestId('cultivo-form'));

    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el tipo de cultivo.')).toBeInTheDocument();
    expect(screen.getByText('La fecha de siembra es obligatoria.')).toBeInTheDocument();
  });
});

describe('CultivoForm · botón de envío', () => {
  it('está deshabilitado mientras haya errores y explica por qué', async () => {
    const { user } = renderForm();

    await expectSubmit('disabled');
    expect(screen.getByTestId('cultivo-form-hint')).toHaveTextContent(/campos obligatorios/);

    await user.type(field.nombre(), 'Café');
    await expectSubmit('disabled');

    await user.selectOptions(field.tipo(), 'frutal');
    await expectSubmit('disabled');
  });

  it('se habilita cuando todos los campos obligatorios son válidos', async () => {
    const { user } = renderForm();
    await fillValid(user);

    await expectSubmit('enabled');
    expect(screen.queryByTestId('cultivo-form-hint')).not.toBeInTheDocument();
  });

  it('vuelve a deshabilitarse si un campo válido deja de serlo', async () => {
    const { user } = renderForm();
    await fillValid(user);
    await expectSubmit('enabled');

    fireEvent.change(field.fecha(), { target: { value: tomorrowISO() } });
    await expectSubmit('disabled');
  });
});

describe('CultivoForm · envío', () => {
  it('llama a onSubmit con los datos normalizados y muestra el toast de éxito', async () => {
    const { user, props } = renderForm();
    await fillValid(user);
    await user.click(field.submit());

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1));
    expect(props.onSubmit).toHaveBeenCalledWith({
      nombre: 'Café Castillo',
      tipo: 'frutal',
      fechaSiembra: VALID_FECHA,
      ubicacion: 'Lote 4',
      estado: 'sano',
    });

    const toast = await screen.findByTestId('ion-toast');
    expect(toast).toHaveTextContent('Cultivo guardado correctamente.');
    expect(toast).toHaveClass('cultivo-toast-success');
  });

  it('limpia el formulario tras guardar en modo creación', async () => {
    const { user } = renderForm();
    await fillValid(user);
    await user.click(field.submit());
    await screen.findByTestId('ion-toast');

    expect(field.nombre()).toHaveValue('');
    expect(field.tipo()).toHaveValue('');
    expect(field.fecha()).toHaveValue('');
    await expectSubmit('disabled');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el estado de carga y bloquea el formulario mientras guarda', async () => {
    const request = deferred<void>();
    const onSubmit = vi.fn(() => request.promise);
    const { user, container } = renderForm({ onSubmit });
    await fillValid(user);

    await user.click(field.submit());

    expect(field.submit()).toHaveTextContent('Guardando…');
    await expectSubmit('disabled');
    expect(container.querySelector('ion-spinner')).toBeInTheDocument();
    expect(field.nombre()).toBeDisabled();
    await waitFor(() => expect(field.cancel()).toBeDisabled());
    expect(screen.getByTestId('cultivo-form')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Guardando cultivo…');

    await act(async () => request.resolve());
    expect(await screen.findByTestId('ion-toast')).toBeInTheDocument();
    expect(container.querySelector('ion-spinner')).not.toBeInTheDocument();
  });

  it('no envía dos veces si se repite el envío mientras guarda', async () => {
    const request = deferred<void>();
    const onSubmit = vi.fn(() => request.promise);
    const { user } = renderForm({ onSubmit });
    await fillValid(user);

    await user.click(field.submit());
    fireEvent.submit(screen.getByTestId('cultivo-form'));
    fireEvent.submit(screen.getByTestId('cultivo-form'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => request.resolve());
  });

  it('muestra un error y conserva los datos si el guardado falla', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('fallo'));
    const { user } = renderForm({ onSubmit });
    await fillValid(user);
    await user.click(field.submit());

    expect(await screen.findByTestId('cultivo-form-submit-error')).toHaveTextContent(
      'No pudimos guardar el cultivo. Inténtalo de nuevo.',
    );
    expect(screen.queryByTestId('ion-toast')).not.toBeInTheDocument();
    expect(field.nombre()).toHaveValue('  Café Castillo  ');
    await expectSubmit('enabled');
  });

  it('no actualiza el estado si se desmonta durante el guardado', async () => {
    const request = deferred<void>();
    const onSubmit = vi.fn(() => request.promise);
    const { user, unmount } = renderForm({ onSubmit });
    await fillValid(user);
    await user.click(field.submit());

    unmount();
    await act(async () => request.resolve());

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('CultivoForm · cancelar con cambios sin guardar', () => {
  it('cancela de inmediato si no hay cambios', async () => {
    const { user, props } = renderForm();
    await user.click(field.cancel());

    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('ion-alert')).not.toBeInTheDocument();
  });

  it('pide confirmación si hay cambios y no cancela hasta confirmar', async () => {
    const { user, props } = renderForm();
    await user.type(field.nombre(), 'Café');
    await user.click(field.cancel());

    const alert = screen.getByTestId('ion-alert');
    expect(alert).toHaveTextContent('¿Descartar cambios?');
    expect(alert).toHaveTextContent('Tienes cambios sin guardar');
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it('«Seguir editando» cierra el aviso y conserva el formulario', async () => {
    const { user, props } = renderForm();
    await user.type(field.nombre(), 'Café');
    await user.click(field.cancel());
    await user.click(screen.getByText('Seguir editando'));

    expect(screen.queryByTestId('ion-alert')).not.toBeInTheDocument();
    expect(props.onCancel).not.toHaveBeenCalled();
    expect(field.nombre()).toHaveValue('Café');
  });

  it('«Descartar cambios» ejecuta onCancel', async () => {
    const { user, props } = renderForm();
    await user.type(field.nombre(), 'Café');
    await user.click(field.cancel());
    await user.click(screen.getByText('Descartar cambios'));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('en edición, tras guardar ya no hay cambios pendientes', async () => {
    const { user, props } = renderForm({
      mode: 'edit',
      initialValues: { nombre: 'Maíz amarillo', tipo: 'cereal', fechaSiembra: VALID_FECHA },
    });

    await user.type(field.nombre(), ' dulce');
    await user.click(field.submit());
    await screen.findByTestId('ion-toast');

    await user.click(field.cancel());
    expect(screen.queryByTestId('ion-alert')).not.toBeInTheDocument();
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('validateCultivoForm / parseCultivoForm', () => {
  const base: CultivoFormValues = {
    ...EMPTY_VALUES,
    nombre: 'Café',
    tipo: 'frutal',
    fechaSiembra: VALID_FECHA,
  };

  it('no devuelve errores con datos válidos', () => {
    expect(validateCultivoForm(base)).toEqual({});
  });

  it.each([
    ['formato incorrecto', 'abc'],
    ['día inexistente', '2024-02-30'],
    ['mes inexistente', '2024-13-01'],
    ['anterior a 1900', '1850-06-01'],
  ])('rechaza una fecha con %s', (_caso, fechaSiembra) => {
    expect(validateCultivoForm({ ...base, fechaSiembra }).fechaSiembra).toBe(
      'Ingresa una fecha válida.',
    );
  });

  it('acepta el 29 de febrero de un año bisiesto', () => {
    expect(validateCultivoForm({ ...base, fechaSiembra: '2024-02-29' })).toEqual({});
  });

  it('usa el parámetro today para decidir si la fecha es futura', () => {
    expect(validateCultivoForm({ ...base, fechaSiembra: '2024-03-12' }, '2024-03-11')).toEqual({
      fechaSiembra: 'La fecha de siembra no puede ser futura.',
    });
    expect(validateCultivoForm({ ...base, fechaSiembra: '2024-03-12' }, '2024-03-12')).toEqual({});
  });

  it('exige exactamente 3 caracteres útiles en el nombre', () => {
    expect(validateCultivoForm({ ...base, nombre: ' ab ' }).nombre).toMatch(/al menos 3/);
    expect(validateCultivoForm({ ...base, nombre: 'abc' })).toEqual({});
  });

  it('parseCultivoForm recorta espacios y conserva el tipo validado', () => {
    const result = parseCultivoForm({ ...base, nombre: '  Café  ', ubicacion: ' Lote 1 ' });
    expect(result).toEqual({
      ok: true,
      data: {
        nombre: 'Café',
        tipo: 'frutal',
        fechaSiembra: VALID_FECHA,
        ubicacion: 'Lote 1',
        estado: 'sano',
      },
    });
  });
});
