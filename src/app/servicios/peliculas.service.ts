import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Pelicula } from '../models/pelicula.model';

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
}
