import { inject, Injectable } from '@angular/core';
import { Asiento } from '../models/asiento.model';
import { CompraHistorial } from '../models/compra.model';
import { Funcion } from '../models/funcion.model';
import { Pelicula } from '../models/pelicula.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly supabase = inject(SupabaseService);

  async obtenerHistorial(usuarioId: string): Promise<CompraHistorial[]> {
    const { data, error } = await this.supabase.cliente
      .from('ventas')
      .select(`
        id,
        funcion_id,
        usuario_id,
        total,
        estado,
        codigo_qr,
        fecha_creacion,
        fecha_cancelacion,
        credito_generado,
        funciones (
          id,
          pelicula_id,
          sala_id,
          fecha,
          hora_inicio,
          hora_fin,
          precio,
          fecha_creacion,
          peliculas (
            id,
            titulo,
            sinopsis,
            duracion_minutos,
            url_poster,
            edad_minima,
            fecha_estreno,
            activa,
            fecha_creacion
          )
        ),
        venta_asientos (
          asiento_id,
          asientos (
            id,
            sala_id,
            fila,
            numero,
            tipo
          )
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((venta: any) => {
      const funcion = venta.funciones as Funcion & { peliculas?: Pelicula };
      const pelicula = funcion?.peliculas as Pelicula;
      const asientos = (venta.venta_asientos ?? [])
        .map((item: any) => item.asientos as Asiento)
        .filter(Boolean);

      return {
        id: venta.id,
        funcion_id: venta.funcion_id,
        usuario_id: venta.usuario_id,
        total: Number(venta.total),
        estado: venta.estado,
        codigo_qr: venta.codigo_qr,
        fecha_creacion: venta.fecha_creacion,
        fecha_cancelacion: venta.fecha_cancelacion ?? null,
        credito_generado: Number(venta.credito_generado ?? 0),
        funcion,
        pelicula,
        asientos,
      } as CompraHistorial;
    });
  }

  async cancelarCompra(ventaId: number): Promise<number> {
    const { data, error } = await this.supabase.cliente.rpc('cancelar_venta', {
      p_venta_id: ventaId,
    });

    if (error) throw error;

    return Number(data ?? 0);
  }

  puedeCancelar(compra: CompraHistorial): boolean {
    if (compra.estado !== 'pagada') return false;

    const funcion = new Date(`${compra.funcion.fecha}T${compra.funcion.hora_inicio}`);
    const limite = funcion.getTime() - 2 * 60 * 60 * 1000;

    return Date.now() < limite;
  }
}
