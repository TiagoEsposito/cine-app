import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuncionesService } from '../../servicios/funciones.service';
import { AsientosService } from '../../servicios/asientos.service';
import { CompraService } from '../../servicios/compra.service';
import { Funcion } from '../../models/funcion.model';
import { Asiento } from '../../models/asiento.model';

@Component({
  selector: 'app-seleccion-asientos',
  templateUrl: './seleccion-asientos.html',
  styleUrl: './seleccion-asientos.scss',
  imports: [RouterLink],
})
export class SeleccionAsientos implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly funcionesService = inject(FuncionesService);
  private readonly asientosService = inject(AsientosService);
  private readonly compraService = inject(CompraService);

  readonly funcion = signal<Funcion | null>(null);
  readonly asientos = signal<Asiento[]>([]);
  readonly asientosOcupados = signal<number[]>([]);
  readonly asientosSeleccionados = signal<number[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!id) {
        throw new Error('Función no encontrada.');
      }

      const funcion = await this.funcionesService.obtenerFuncion(id);

      if (!funcion) {
        throw new Error('Función no encontrada.');
      }

      const [asientos, asientosOcupados] = await Promise.all([
        this.asientosService.obtenerAsientos(funcion.sala_id),
        this.asientosService.obtenerAsientosOcupados(id),
      ]);

      this.funcion.set(funcion);
      this.asientos.set(asientos);
      this.asientosOcupados.set(asientosOcupados);

      const seleccionAnterior = this.compraService.asientos();
      if (this.compraService.funcion()?.id === funcion.id) {
        this.asientosSeleccionados.set(
          seleccionAnterior
            .filter((asiento) => !asientosOcupados.includes(asiento.id))
            .map((asiento) => asiento.id)
        );
      }
    } catch (error: unknown) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la función.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  alternarAsiento(asiento: Asiento): void {
    if (this.estaOcupado(asiento.id)) {
      return;
    }

    const seleccionados = this.asientosSeleccionados();

    if (seleccionados.includes(asiento.id)) {
      this.asientosSeleccionados.set(
        seleccionados.filter((id) => id !== asiento.id)
      );
      return;
    }

    this.asientosSeleccionados.set([...seleccionados, asiento.id]);
  }

  estaSeleccionado(asientoId: number): boolean {
    return this.asientosSeleccionados().includes(asientoId);
  }

  estaOcupado(asientoId: number): boolean {
    return this.asientosOcupados().includes(asientoId);
  }

  obtenerAsientosPorFila(fila: string): Asiento[] {
    return this.asientos().filter((asiento) => asiento.fila === fila);
  }

  get filas(): string[] {
    return [...new Set(this.asientos().map((asiento) => asiento.fila))];
  }

  obtenerAsientosSeleccionados(): Asiento[] {
    return this.asientos().filter((asiento) =>
      this.asientosSeleccionados().includes(asiento.id)
    );
  }

  obtenerPrecioAsiento(asiento: Asiento): number {
    const precioBase = this.funcion()?.precio ?? 0;
    return asiento.tipo === 'vip' ? precioBase * 1.5 : precioBase;
  }

  obtenerTotal(): number {
    return this.obtenerAsientosSeleccionados().reduce(
      (total, asiento) => total + this.obtenerPrecioAsiento(asiento),
      0
    );
  }

  continuarCompra(): void {
    const funcion = this.funcion();
    const asientos = this.obtenerAsientosSeleccionados();

    if (!funcion || asientos.length === 0) {
      return;
    }

    this.compraService.guardarSeleccion(funcion, asientos);
    void this.router.navigate(['/funcion', funcion.id, 'resumen']);
  }
}
