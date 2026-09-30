import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Asiento } from '../models/asiento.model';
import { CandyItem } from '../models/candy.model';

@Injectable({ providedIn: 'root' })
export class AsientosService {
  private readonly supabase = inject(SupabaseService);
  async obtenerAsientos(salaId: number): Promise<Asiento[]> {
    const { data, error } = await this.supabase.cliente.from('asientos').select('*').eq('sala_id', salaId).order('fila').order('numero');
    if (error) throw error; return data ?? [];
  }
  async obtenerAsientosOcupados(funcionId: number): Promise<number[]> {
    const { data, error } = await this.supabase.cliente.rpc('asientos_ocupados', { p_funcion_id: funcionId });
    if (error) throw error; return (data ?? []).map((item: { asiento_id: number }) => item.asiento_id);
  }
  async crearVenta(funcionId: number, _usuarioId: string | null, asientoIds: number[], _total: number, candy: CandyItem[] = []): Promise<{ id: number; codigoQr: string; total: number }> {
    const { data, error } = await this.supabase.cliente.rpc('crear_venta_con_asientos_y_candy', {
      p_funcion_id: funcionId,
      p_asiento_ids: asientoIds,
      p_productos: candy.map(x => ({ producto_id: x.id, cantidad: x.cantidad }))
    });
    if (error) throw error;
    const venta = Array.isArray(data) ? data[0] : data;
    if (!venta) throw new Error('No se pudo crear la venta.');
    return { id: Number(venta.venta_id), codigoQr: venta.codigo_qr, total: Number(venta.total) };
  }
}
