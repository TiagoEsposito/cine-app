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
