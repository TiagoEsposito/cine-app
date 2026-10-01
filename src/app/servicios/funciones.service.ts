import { inject, Injectable } from '@angular/core';
import { Funcion } from '../models/funcion.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class FuncionesService {
  private readonly supabase = inject(SupabaseService);

  private aplicarPreventa(funciones: Funcion[], peliculas: any[]): Funcion[] {
    const hoy = new Date();
    return funciones.map(f => {
      const pelicula = peliculas.find(p => p.id === f.pelicula_id);
      if (!pelicula?.preventa_activa || !pelicula?.fecha_estreno) return f;
      const estreno = new Date(`${pelicula.fecha_estreno}T00:00:00`);
      const inicio = new Date(estreno); inicio.setDate(inicio.getDate() - 7);
      const fechaFuncion = new Date(`${f.fecha}T${f.hora_inicio}`);
      const esPreventa = fechaFuncion >= inicio && fechaFuncion < estreno && hoy <= estreno;
      return esPreventa && pelicula.precio_preventa != null ? { ...f, precio: Number(pelicula.precio_preventa), es_preventa: true } : f;
    });
  }

  async obtenerFunciones(peliculaId: number): Promise<Funcion[]> {
    const { data, error } = await this.supabase.cliente.from('funciones').select('*').eq('pelicula_id', peliculaId).order('fecha').order('hora_inicio');
    if (error) throw error;
    const { data: peliculas } = await this.supabase.cliente.from('peliculas').select('id,preventa_activa,precio_preventa,fecha_estreno').eq('id', peliculaId);
    return this.aplicarPreventa((data ?? []) as Funcion[], peliculas ?? []);
  }

  async obtenerFuncion(id: number): Promise<Funcion | null> {
    const { data, error } = await this.supabase.cliente.from('funciones').select('*').eq('id', id).single();
    if (error) throw error;
    const { data: peliculas } = await this.supabase.cliente.from('peliculas').select('id,preventa_activa,precio_preventa,fecha_estreno').eq('id', data.pelicula_id);
    return this.aplicarPreventa([data as Funcion], peliculas ?? [])[0] ?? null;
  }
}
