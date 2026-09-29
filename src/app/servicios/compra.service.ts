import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Asiento } from '../models/asiento.model';
import { Funcion } from '../models/funcion.model';

export interface VentaCreada {
  id: number;
  codigoQr: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  private readonly router = inject(Router);

  readonly funcion = signal<Funcion | null>(null);
  readonly asientos = signal<Asiento[]>([]);
  readonly venta = signal<VentaCreada | null>(null);

  guardarSeleccion(funcion: Funcion, asientos: Asiento[]): void {
    this.funcion.set(funcion);
    this.asientos.set(asientos);
    this.venta.set(null);
  }

  guardarVenta(venta: VentaCreada): void {
    this.venta.set(venta);
  }

  tieneSeleccion(): boolean {
    return this.funcion() !== null && this.asientos().length > 0;
  }

  tieneVenta(): boolean {
    return this.venta() !== null;
  }

  volverAAsientos(): void {
    const funcion = this.funcion();

    if (funcion) {
      void this.router.navigate(['/funcion', funcion.id]);
    }
  }

  limpiar(): void {
    this.funcion.set(null);
    this.asientos.set([]);
    this.venta.set(null);
  }
}
