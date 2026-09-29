import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { ComprasService } from '../../servicios/compras.service';
import { CompraHistorial } from '../../models/compra.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  imports: [RouterLink, CommonModule],
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly comprasService = inject(ComprasService);

  readonly compras = signal<CompraHistorial[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly editando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);
  readonly errorCancelacion = signal<string | null>(null);

  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly fechaNacimiento = signal('');
  readonly tipoSangre = signal('');
  readonly colorOjos = signal('');
  readonly diasVacaciones = signal('');

  readonly tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  readonly coloresOjos = ['Marrones', 'Negros', 'Azules', 'Verdes', 'Celestes', 'Grises', 'Avellana'];

  async ngOnInit(): Promise<void> {
    await this.auth.listo;
    this.cargarFormulario();

    const usuarioId = this.auth.perfil()?.id;
    if (!usuarioId) {
      this.error.set('No se pudo recuperar tu perfil.');
      this.cargando.set(false);
      return;
    }

    try {
      this.compras.set(await this.comprasService.obtenerHistorial(usuarioId));
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo cargar tu historial.');
    } finally {
      this.cargando.set(false);
    }
  }

  cargarFormulario(): void {
    const perfil = this.auth.perfil();
    if (!perfil) return;
    this.nombre.set(perfil.nombre ?? '');
    this.apellido.set(perfil.apellido ?? '');
    this.fechaNacimiento.set(perfil.fecha_nacimiento ?? '');
    this.tipoSangre.set(perfil.tipo_sangre ?? '');
    this.colorOjos.set(perfil.color_ojos ?? '');
    this.diasVacaciones.set(String(perfil.dias_vacaciones ?? ''));
  }

  empezarEdicion(): void {
    this.cargarFormulario();
    this.mensaje.set(null);
    this.error.set(null);
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.cargarFormulario();
    this.editando.set(false);
  }

  async guardarPerfil(): Promise<void> {
    this.guardando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    const vacaciones = Number(this.diasVacaciones());
    if (!this.nombre().trim() || !this.apellido().trim() || !this.fechaNacimiento() || !this.tipoSangre() || !this.colorOjos() || !Number.isInteger(vacaciones) || vacaciones < 0 || vacaciones > 365) {
      this.error.set('Completá correctamente todos los datos del perfil.');
      this.guardando.set(false);
      return;
    }

    const error = await this.auth.actualizarPerfil({
      nombre: this.nombre().trim(),
      apellido: this.apellido().trim(),
      fecha_nacimiento: this.fechaNacimiento(),
      tipo_sangre: this.tipoSangre(),
      color_ojos: this.colorOjos(),
      dias_vacaciones: vacaciones,
    });

    if (error) {
      this.error.set(error);
    } else {
      this.editando.set(false);
      this.mensaje.set('Perfil actualizado correctamente.');
    }

    this.guardando.set(false);
  }

  puedeCancelar(compra: CompraHistorial): boolean {
    return this.comprasService.puedeCancelar(compra);
  }

  async cancelarCompra(compra: CompraHistorial): Promise<void> {
    if (!this.puedeCancelar(compra)) return;
    if (!window.confirm(`¿Querés cancelar la compra #${compra.id}? El importe se acreditará en tu cuenta.`)) return;

    this.errorCancelacion.set(null);
    try {
      const credito = await this.comprasService.cancelarCompra(compra.id);
      compra.estado = 'cancelada';
      compra.credito_generado = credito;
      compra.fecha_cancelacion = new Date().toISOString();
      await this.auth.recargarPerfil();
      this.compras.set([...this.compras()]);
    } catch (error: unknown) {
      this.errorCancelacion.set(error instanceof Error ? error.message : 'No se pudo cancelar la compra.');
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigate(['/cartelera']);
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(`${fecha}T12:00:00`));
  }

  formatearDinero(valor: number): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(valor);
  }
}
