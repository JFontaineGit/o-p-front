import { UserRead } from '../interfaces/user.interfaces';

/**
 * Posibles acciones para la auditoría.
 */
export type AuditAction = 'create' | 'update' | 'delete' | 'other';

/**
 * Interfaz para datos de auditoría relacionados con un empleado.
 */
export interface Audit {
  id: number;
  action: AuditAction;
  date: string; // Fecha en formato ISO
  observation: string;
  content_type_id: number;
  object_id: number;
}

/**
 * Interfaz base para las propiedades de un empleado.
 */
export interface EmployeeBase {
  user_id: number;
  employee_file: string;
  state: string;
}

/**
 * Interfaz para crear un nuevo empleado.
 * Hereda todos los campos de EmployeeBase.
 */
export interface EmployeeCreate extends EmployeeBase {}

/**
 * Interfaz para actualizar un empleado.
 * Todos los campos son opcionales para actualizaciones parciales.
 */
export interface EmployeeUpdate {
  user_id?: number;
  employee_file?: string;
  state?: string;
}

/**
 * Interfaz para la respuesta de datos de un empleado, incluyendo usuario anidado y auditorías.
 */
export interface EmployeeResponse extends EmployeeBase {
  id: number;
  user: UserRead; // De user.interfaces.ts
  audits: Audit[];
}

/**
 * Interfaz para la respuesta de eliminación de un empleado.
 */
export interface EmployeeDelete {
  message: string;
  id: number;
}

/**
 * Interfaz para respuestas de error de la API.
 */
export interface ErrorResponse {
  message: string;
  detail?: string;
}