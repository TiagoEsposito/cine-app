import { Component, inject, OnInit, signal } from '@angular/core';
import { Pelicula } from '../../models/pelicula.model';
import { PeliculasService } from '../../servicios/peliculas.service';

@Component({
  selector: 'app-cartelera',
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.scss',
})
export class Cartelera implements OnInit {
  private readonly peliculasService = inject(PeliculasService);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly error = signal<string | null>(null);
  readonly cargando = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.peliculas.set(await this.peliculasService.obtenerPeliculas());
    } catch (error: unknown) {
      const mensaje = error instanceof Error
        ? error.message
        : 'Error al cargar las películas.';
      this.error.set(mensaje);
    } finally {
      this.cargando.set(false);
    }
  }
}
