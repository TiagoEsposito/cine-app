import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsientosService } from '../../servicios/asientos.service';
import { AuthService } from '../../servicios/auth.service';
import { CompraService } from '../../servicios/compra.service';
import { Asiento } from '../../models/asiento.model';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.html',
  styleUrl: './pago.scss',
  imports: [RouterLink],
})
export class Pago {
  private readonly asientosService = inject(AsientosService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly compra = inject(CompraService);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);

  obtenerPrecioAsiento(asiento: Asiento): number {
    const precioBase = this.compra.funcion()?.precio ?? 0;
    return asiento.tipo === 'vip' ? precioBase * 1.5 : precioBase;
  }

  obtenerTotal(): number {
    return this.compra.asientos().reduce(
      (total, asiento) => total + this.obtenerPrecioAsiento(asiento),
      0
    );
  }

  async pagar(): Promise<void> {
    if (!this.compra.tieneSeleccion() || this.procesando()) {
      return;
    }

    const funcion = this.compra.funcion()!;
    const asientoIds = this.compra.asientos().map((asiento) => asiento.id);

    this.procesando.set(true);
    this.error.set(null);

    try {
      const ocupados = await this.asientosService.obtenerAsientosOcupados(funcion.id);
      const hayOcupados = asientoIds.some((id) => ocupados.includes(id));

      if (hayOcupados) {
        throw new Error('Uno de los asientos seleccionados ya fue ocupado. Volvé a elegir tus asientos.');
      }

      const usuarioId = this.authService.perfil()?.id ?? null;
      const venta = await this.asientosService.crearVenta(
        funcion.id,
        usuarioId,
        asientoIds,
        this.obtenerTotal()
      );

      this.compra.guardarVenta(venta);
      await this.router.navigate(['/compra', venta.id]);
    } catch (error: unknown) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo procesar el pago.'
      );
    } finally {
      this.procesando.set(false);
    }
  }
}
