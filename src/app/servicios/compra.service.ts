import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Asiento } from '../models/asiento.model';
import { CandyItem } from '../models/candy.model';
import { Funcion } from '../models/funcion.model';

export interface VentaCreada { id: number; codigoQr: string; total: number; }

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly router = inject(Router);
  readonly funcion = signal<Funcion | null>(null);
  readonly asientos = signal<Asiento[]>([]);
  readonly candy = signal<CandyItem[]>([]);
  readonly venta = signal<VentaCreada | null>(null);

  guardarSeleccion(funcion: Funcion, asientos: Asiento[]): void {
    this.funcion.set(funcion); this.asientos.set(asientos); this.candy.set([]); this.venta.set(null);
  }
  agregarCandy(item: CandyItem): void {
    this.candy.update(actual => {
      const existente = actual.find(x => x.id === item.id);
      if (existente) return actual.map(x => x.id === item.id ? { ...x, cantidad: Math.min(x.cantidad + 1, x.stock) } : x);
      return [...actual, { ...item, cantidad: 1 }];
    });
  }
  quitarCandy(id: number): void {
    this.candy.update(actual => actual.flatMap(x => x.id === id ? (x.cantidad > 1 ? [{ ...x, cantidad: x.cantidad - 1 }] : []) : [x]));
  }
  eliminarCandy(id: number): void { this.candy.update(actual => actual.filter(x => x.id !== id)); }
  totalCandy(): number { return this.candy().reduce((s, x) => s + x.precio * x.cantidad, 0); }
  guardarVenta(venta: VentaCreada): void { this.venta.set(venta); }
  tieneSeleccion(): boolean { return this.funcion() !== null && this.asientos().length > 0; }
  tieneVenta(): boolean { return this.venta() !== null; }
  volverAAsientos(): void { const funcion = this.funcion(); if (funcion) void this.router.navigate(['/funcion', funcion.id]); }
  limpiar(): void { this.funcion.set(null); this.asientos.set([]); this.candy.set([]); this.venta.set(null); }
}
