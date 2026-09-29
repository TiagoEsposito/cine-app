import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PeliculasService } from '../../servicios/peliculas.service';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.html',
  styleUrl: './detalle-pelicula.scss',
})
export class DetallePelicula implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly peliculasService = inject(PeliculasService);

  readonly pelicula = signal<Pelicula | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!id) {
        throw new Error('Película no encontrada.');
      }

      const pelicula = await this.peliculasService.obtenerPelicula(id);

      this.pelicula.set(pelicula);
    } catch (error: unknown) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la película.'
      );
    } finally {
      this.cargando.set(false);
    }
  }
}