import { inject, Injectable } from '@angular/core';
import { Funcion } from '../models/funcion.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class FuncionesService {
  private readonly supabase = inject(SupabaseService);
  async obtenerFunciones(peliculaId: number): Promise<Funcion[]> {
    const { data, error } = await this.supabase.cliente.from('funciones').select('*').eq('pelicula_id', peliculaId).order('fecha').order('hora_inicio');
    if (error) throw error;
    return data ?? [];
  }
  async obtenerFuncion(id: number): Promise<Funcion | null> {
  const { data, error } = await this.supabase.cliente
    .from('funciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data as Funcion;
}
}
