import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./componentes/perfil/perfil').then((m) => m.PerfilComponent),
  },
  {
    path: 'mis-peliculas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./componentes/mis-peliculas/mis-peliculas').then((m) => m.MisPeliculas),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./componentes/admin/admin').then((m) => m.Admin),
  },
  {
    path: 'pelicula/:id',
    loadComponent: () =>
      import('./componentes/detalle-pelicula/detalle-pelicula')
        .then((m) => m.DetallePelicula),
  },
  {
    path: 'funcion/:id/resumen',
    loadComponent: () =>
      import('./componentes/resumen-compra/resumen-compra')
        .then((m) => m.ResumenCompra),
  },
  {
    path: 'funcion/:id/pago',
    loadComponent: () =>
      import('./componentes/pago/pago')
        .then((m) => m.Pago),
  },
  {
    path: 'funcion/:id',
    loadComponent: () =>
      import('./componentes/seleccion-asientos/seleccion-asientos')
        .then((m) => m.SeleccionAsientos),
  },
  {
    path: 'compra/:id',
    loadComponent: () =>
      import('./componentes/compra-confirmada/compra-confirmada')
        .then((m) => m.CompraConfirmada),
  },
  {
    path: '**',
    redirectTo: 'cartelera',
  },

];