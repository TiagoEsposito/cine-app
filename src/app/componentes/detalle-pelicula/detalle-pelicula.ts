import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeliculasService } from '../../servicios/peliculas.service';
import { FuncionesService } from '../../servicios/funciones.service';
import { Pelicula } from '../../models/pelicula.model';
import { Funcion } from '../../models/funcion.model';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.html',
  styleUrl: './detalle-pelicula.scss',
  imports: [RouterLink],
})
export class DetallePelicula implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly peliculasService = inject(PeliculasService);
  private readonly funcionesService = inject(FuncionesService);

  readonly pelicula = signal<Pelicula | null>(null);
  readonly funciones = signal<Funcion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!id) {
        throw new Error('Película no encontrada.');
      }

      const [pelicula, funciones] = await Promise.all([
        this.peliculasService.obtenerPelicula(id),
        this.funcionesService.obtenerFunciones(id),
      ]);

      this.pelicula.set(pelicula);
      this.funciones.set(funciones);
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