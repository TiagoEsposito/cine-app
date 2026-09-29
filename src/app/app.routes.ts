import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cartelera',
  },
  {
    path: 'cartelera',
    loadComponent: () =>
      import('./componentes/cartelera/cartelera').then((m) => m.Cartelera),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./componentes/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'pelicula/:id',
    loadComponent: () =>
      import('./componentes/detalle-pelicula/detalle-pelicula')
        .then((m) => m.DetallePelicula),
  },
  {
    path: '**',
    redirectTo: 'cartelera',
  },
];