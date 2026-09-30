import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Sala } from '../models/sala.model';
import { Funcion } from '../models/funcion.model';

@Injectable({providedIn:'root'})
export class AdminService {
  private readonly supabase = inject(SupabaseService);
  async obtenerSalas(): Promise<Sala[]> { const {data,error}=await this.supabase.cliente.from('salas').select('*').order('id'); if(error)throw error; return data??[]; }
  async crearSala(nombre:string):Promise<Sala>{const {data,error}=await this.supabase.cliente.from('salas').insert({nombre}).select().single();if(error)throw error;return data;}
  async generarAsientos(salaId:number):Promise<number>{const {data,error}=await this.supabase.cliente.rpc('generar_asientos_sala',{p_sala_id:salaId});if(error)throw error;return Number(data??0);}
  async obtenerFunciones():Promise<Funcion[]> {const {data,error}=await this.supabase.cliente.from('funciones').select('*').order('fecha').order('hora_inicio');if(error)throw error;return data??[];}
  async crearFuncionAuto(peliculaId:number,fecha:string,horaInicio:string,horaFin:string,precio:number):Promise<number>{const {data,error}=await this.supabase.cliente.rpc('crear_funcion_auto_sala',{p_pelicula_id:peliculaId,p_fecha:fecha,p_hora_inicio:horaInicio,p_hora_fin:horaFin,p_precio:precio});if(error)throw error;return Number(data);}
}
