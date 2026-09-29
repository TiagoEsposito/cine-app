import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Asiento } from '../models/asiento.model';

@Injectable({
  providedIn: 'root',
})
export class AsientosService {
  private readonly supabase = inject(SupabaseService);

  async obtenerAsientos(salaId: number): Promise<Asiento[]> {
    const { data, error } = await this.supabase.cliente
      .from('asientos')
      .select('*')
      .eq('sala_id', salaId)
      .order('fila')
      .order('numero');

    if (error) throw error;

    return data ?? [];
  }

  async obtenerAsientosOcupados(funcionId: number): Promise<number[]> {
    const { data, error } = await this.supabase.cliente
      .rpc('asientos_ocupados', {
        p_funcion_id: funcionId,
      });

    if (error) throw error;

    return (data ?? []).map(
      (item: { asiento_id: number }) => item.asiento_id
    );
  }

  async crearVenta(
    funcionId: number,
    usuarioId: string | null,
    asientoIds: number[],
    total: number
  ): Promise<{ id: number; codigoQr: string }> {
    const codigoQr = crypto.randomUUID();

    const { data: venta, error: errorVenta } =
      await this.supabase.cliente
        .from('ventas')
        .insert({
          funcion_id: funcionId,
          usuario_id: usuarioId,
          total,
          estado: 'pagada',
          codigo_qr: codigoQr,
        })
        .select('id, codigo_qr')
        .single();

    if (errorVenta) throw errorVenta;

    const registros = asientoIds.map((asientoId) => ({
      venta_id: venta.id,
      asiento_id: asientoId,
    }));

    const { error: errorAsientos } =
      await this.supabase.cliente
        .from('venta_asientos')
        .insert(registros);

    if (errorAsientos) throw errorAsientos;

    return {
      id: venta.id,
      codigoQr: venta.codigo_qr,
    };
  }
}