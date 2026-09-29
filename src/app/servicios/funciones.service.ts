import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Funcion } from '../models/funcion.model';

@Injectable({
  providedIn: 'root',
})
export class FuncionesService {
  private readonly supabase = inject(SupabaseService);

  async obtenerFunciones(peliculaId: number): Promise<Funcion[]> {
    const { data, error } = await this.supabase.cliente
      .from('funciones')
      .select('*')
      .eq('pelicula_id', peliculaId)
      .order('fecha')
      .order('hora_inicio');

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}