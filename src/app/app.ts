import { Component, inject, OnInit, signal } from '@angular/core';
import { Pelicula, PeliculasService } from './peliculas/peliculas.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private peliculasService = inject(PeliculasService);

  peliculas = signal<Pelicula[]>([]);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.peliculas.set(await this.peliculasService.obtenerPeliculas());
    } catch (e: any) {
      this.error.set(e.message ?? 'Error al cargar las películas');
    }
  }
}
