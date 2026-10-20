import type { Cultivo } from '../types/cultivo';

const MOCK_CULTIVOS: Cultivo[] = [
  { id: 'c-001', nombre: 'Café Castillo', variedad: 'Castillo', lote: '1', hectareas: 2.5, estado: 'sano', fechaSiembra: '2024-03-12' },
  { id: 'c-002', nombre: 'Maíz amarillo', variedad: 'ICA V-305', lote: '4', hectareas: 1.2, estado: 'atencion', fechaSiembra: '2025-08-02' },
  { id: 'c-003', nombre: 'Papa pastusa', variedad: 'Pastusa suprema', lote: '2', hectareas: 0.8, estado: 'cosecha', fechaSiembra: '2025-06-20' },
  { id: 'c-004', nombre: 'Plátano hartón', variedad: 'Hartón', lote: '6', hectareas: 3, estado: 'sano', fechaSiembra: '2023-11-05' },
  { id: 'c-005', nombre: 'Frijol cargamanto', variedad: 'Cargamanto rojo', lote: '3', hectareas: 0.5, estado: 'atencion', fechaSiembra: '2025-09-14' },
];

let simulateFailure = false;

/** Utilidad de demo: fuerza que la siguiente carga falle (útil para probar el estado de error). */
export function setSimulatedFailure(value: boolean): void {
  simulateFailure = value;
}

/** Simula una llamada de red. Sustituir por la API real (fetch / Capacitor HTTP). */
export async function fetchCultivos(): Promise<Cultivo[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (simulateFailure) {
    throw new Error('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  return MOCK_CULTIVOS;
}
