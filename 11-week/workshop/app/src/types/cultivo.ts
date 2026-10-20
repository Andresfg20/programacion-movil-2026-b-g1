export type CultivoEstado = 'sano' | 'atencion' | 'cosecha';

export interface Cultivo {
  id: string;
  nombre: string;
  variedad: string;
  lote: string;
  hectareas: number;
  estado: CultivoEstado;
  /** Fecha ISO (YYYY-MM-DD) */
  fechaSiembra: string;
}

export type ViewStatus = 'loading' | 'success' | 'error';
