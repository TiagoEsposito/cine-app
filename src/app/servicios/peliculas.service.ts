import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Pelicula } from '../models/pelicula.model';
import { Resena } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class PeliculasService {
  private readonly supabase = inject(SupabaseService);

  async obtenerPeliculas(): Promise<Pelicula[]> {
    const { data, error } = await this.supabase.cliente
      .from('peliculas')
      .select('*, generos(id, nombre)')
      .order('fecha_estreno', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Pelicula[];
  }

async obtenerGeneros(): Promise<{ id: number; nombre: string }[]> {
  const { data, error } = await this.supabase.cliente
    .from('generos')
    .select('id, nombre')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data ?? [];
}
async obtenerResenas(peliculaId: number): Promise<Resena[]> {
  const { data, error } = await this.supabase.cliente
    .from('reseñas')
    .select('*')
    .eq('pelicula_id', peliculaId)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async crearResena(
  peliculaId: number,
  usuarioId: string,
  puntuacion: number,
  comentario: string
): Promise<Resena> {
  const { data, error } = await this.supabase.cliente
    .from('reseñas')
    .insert({
      pelicula_id: peliculaId,
      usuario_id: usuarioId,
      puntuacion,
      comentario,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Resena;
}
}