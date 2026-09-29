import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';

export interface Genero {
  id: number;
  nombre: string;
}

export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string;
  duracion_minutos: number;
  url_poster: string | null;
  edad_minima: number;
  fecha_estreno: string | null;
  activa: boolean;
  generos: Genero[];
}

@Injectable({ providedIn: 'root' })
export class PeliculasService {
  private supabase = inject(SupabaseService);

  async obtenerPeliculas(): Promise<Pelicula[]> {
    const { data, error } = await this.supabase.cliente
      .from('peliculas')
      .select('*, generos(id, nombre)')
      .order('fecha_estreno', { ascending: false });

    if (error) throw error;
    return data as Pelicula[];
  }
}
