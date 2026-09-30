import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../servicios/admin.service';
import { PeliculasService } from '../../servicios/peliculas.service';
import { Pelicula } from '../../models/pelicula.model';
import { Sala } from '../../models/sala.model';
import { Funcion } from '../../models/funcion.model';

@Component({selector:'app-admin',templateUrl:'./admin.html',styleUrl:'./admin.scss',imports:[FormsModule]})
export class Admin implements OnInit {
  private readonly admin = inject(AdminService); private readonly peliculasService = inject(PeliculasService);
  readonly salas=signal<Sala[]>([]); readonly funciones=signal<Funcion[]>([]); readonly peliculas=signal<Pelicula[]>([]); readonly mensaje=signal(''); readonly error=signal('');
  nuevaSala=''; salaEnProceso=signal<number|null>(null); peliculaId=0; fecha=''; horaInicio=''; horaFin=''; precio=5000;
  async ngOnInit(){await this.recargar(); this.peliculas.set(await this.peliculasService.obtenerPeliculas());}
  async recargar(){this.salas.set(await this.admin.obtenerSalas());this.funciones.set(await this.admin.obtenerFunciones());}
  async crearSala(){if(!this.nuevaSala.trim())return;try{await this.admin.crearSala(this.nuevaSala.trim());this.nuevaSala='';this.mensaje.set('Sala creada.');await this.recargar();}catch(e){this.error.set(e instanceof Error?e.message:'No se pudo crear la sala.');}}
  async generarAsientos(sala:Sala){this.salaEnProceso.set(sala.id);this.error.set('');try{const total=await this.admin.generarAsientos(sala.id);this.mensaje.set(`Se generaron ${total} asientos en ${sala.nombre}.`);}catch(e){this.error.set(e instanceof Error?e.message:'No se pudieron generar los asientos.');}finally{this.salaEnProceso.set(null);}}
  async crearFuncion(){this.error.set('');this.mensaje.set('');if(!this.peliculaId||!this.fecha||!this.horaInicio||!this.horaFin)return;try{const id=await this.admin.crearFuncionAuto(this.peliculaId,this.fecha,this.horaInicio,this.horaFin,this.precio);this.mensaje.set(`Función #${id} creada y sala asignada automáticamente.`);await this.recargar();}catch(e){this.error.set(e instanceof Error?e.message:'No se pudo crear la función.');}}
  peliculaTitulo(id:number){return this.peliculas().find(p=>p.id===id)?.titulo??`Película #${id}`;}
}
