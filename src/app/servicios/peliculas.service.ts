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

    if (error) throw error;
    return (data ?? []) as Pelicula[];
  }

  async obtenerGeneros(): Promise<{ id: number; nombre: string }[]> {
    const { data, error } = await this.supabase.cliente
      .from('generos')
      .select('id, nombre')
      .order('nombre');

    if (error) throw error;
    return data ?? [];
  }

  async obtenerResenas(peliculaId: number): Promise<Resena[]> {
    const { data, error } = await this.supabase.cliente
      .from('reseñas_publicas')
      .select('*')
      .eq('pelicula_id', peliculaId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((resena: any) => ({
      id: resena.id,
      pelicula_id: resena.pelicula_id,
      usuario_id: resena.usuario_id,
      puntuacion: resena.puntuacion,
      comentario: resena.comentario,
      fecha_creacion: resena.fecha_creacion,
      usuario: {
        nombre: resena.nombre ?? 'Usuario',
        apellido: resena.apellido ?? '',
      },
    }));
  }

  async obtenerResenaDelUsuario(
    peliculaId: number,
    usuarioId: string
  ): Promise<Resena | null> {
    const { data, error } = await this.supabase.cliente
      .from('reseñas')
      .select('*')
      .eq('pelicula_id', peliculaId)
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (error) throw error;
    return data as Resena | null;
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
      if (error.code === '23505') {
        throw new Error('Ya dejaste una reseña para esta película.');
      }
      throw error;
    }

    return data as Resena;
  }

  async obtenerPelicula(id: number): Promise<Pelicula | null> {
    const { data, error } = await this.supabase.cliente
      .from('peliculas')
      .select('*, generos(id, nombre)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Pelicula;
  }
}
