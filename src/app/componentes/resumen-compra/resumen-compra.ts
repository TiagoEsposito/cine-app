import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompraService } from '../../servicios/compra.service';
import { Asiento } from '../../models/asiento.model';
import { CandyCategoria, CandyProducto } from '../../models/candy.model';
import { CandyService } from '../../servicios/candy.service';

@Component({ selector: 'app-resumen-compra', templateUrl: './resumen-compra.html', styleUrl: './resumen-compra.scss', imports: [RouterLink] })
export class ResumenCompra implements OnInit {
  readonly compra = inject(CompraService);
  private readonly candyService = inject(CandyService);
  readonly categorias = signal<CandyCategoria[]>([]);
  readonly categoriaSeleccionada = signal<number | null>(null);
  readonly productos = signal<CandyProducto[]>([]);
  readonly cargandoCandy = signal(true);
  readonly errorCandy = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try { this.categorias.set(await this.candyService.obtenerCategorias()); this.productos.set(await this.candyService.obtenerProductos()); }
    catch (e) { this.errorCandy.set(e instanceof Error ? e.message : 'No se pudo cargar Candy Bar.'); }
    finally { this.cargandoCandy.set(false); }
  }
  obtenerPrecioAsiento(asiento: Asiento): number { const base = this.compra.funcion()?.precio ?? 0; return asiento.tipo === 'vip' ? base * 1.5 : base; }
  obtenerTotalEntradas(): number { return this.compra.asientos().reduce((t, a) => t + this.obtenerPrecioAsiento(a), 0); }
  obtenerTotal(): number { return this.obtenerTotalEntradas() + this.compra.totalCandy(); }
  cantidad(id: number): number { return this.compra.candy().find(x => x.id === id)?.cantidad ?? 0; }
  productosFiltrados(): CandyProducto[] { const categoria = this.categoriaSeleccionada(); return categoria ? this.productos().filter(p => p.categoria_id === categoria) : this.productos(); }
}
