export interface Asiento {
  id: number;
  sala_id: number;
  fila: string;
  numero: number;
  tipo: 'normal' | 'accesible' | 'vip';
}