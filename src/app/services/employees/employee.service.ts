import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { EmployeeCreate, EmployeeResponse, EmployeeUpdate, Audit } from '../interfaces/employee.interfaces';
import { EMPLOYEE_ENDPOINTS } from './employee-endpoints';

/**
 * Servicio para manejar operaciones relacionadas con empleados.
 * Proporciona métodos para crear, leer, actualizar y eliminar empleados,
 * así como para obtener auditorías de empleados.
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiService = inject(ApiService);
  private logger = inject(LoggerService);

  constructor() { }

  /**
   * Crea un nuevo empleado.
   * @param payload Datos del empleado a crear.
   * @returns Observable con la respuesta del servidor.
   */
  public createEmployee(payload: EmployeeCreate): Observable<EmployeeResponse> {
    return this.apiService.post<EmployeeResponse, EmployeeCreate>(EMPLOYEE_ENDPOINTS.CREATE, payload).pipe(
      tap(response => this.logger.debug('Empleado creado exitosamente', response)),
      catchError(this.handleError<EmployeeResponse>('createEmployee'))
    );
  }

  /**
   * Lista todos los empleados.
   * @returns Observable con la lista de empleados.
   */
  public listEmployees(): Observable<EmployeeResponse[]> {
    return this.apiService.get<EmployeeResponse[]>(EMPLOYEE_ENDPOINTS.GET_ALL).pipe(
      tap(response => this.logger.debug('Lista de empleados obtenida', response)),
      catchError(this.handleError<EmployeeResponse[]>('listEmployees'))
    );
  }

  /**
   * Obtiene un empleado por su ID.
   * @param employeeId ID del empleado.
   * @returns Observable con los datos del empleado.
   */
  public getEmployee(employeeId: number): Observable<EmployeeResponse> {
    const endpoint = `${EMPLOYEE_ENDPOINTS.GET_ONE}/${employeeId}/see`;
    return this.apiService.get<EmployeeResponse>(endpoint).pipe(
      tap(response => this.logger.debug(`Empleado con ID ${employeeId} obtenido`, response)),
      catchError(this.handleError<EmployeeResponse>('getEmployee'))
    );
  }

  /**
   * Obtiene las auditorías de un empleado.
   * @param employeeId ID del empleado.
   * @param limit Número máximo de auditorías a obtener (opcional, por defecto 10).
   * @returns Observable con la lista de auditorías.
   */
  public getEmployeeAudits(employeeId: number, limit: number = 10): Observable<Audit[]> {
    const endpoint = `${EMPLOYEE_ENDPOINTS.GET_AUDITS}/${employeeId}/audits?limit=${limit}`;
    return this.apiService.get<Audit[]>(endpoint).pipe(
      tap(response => this.logger.debug(`Auditorías del empleado con ID ${employeeId} obtenidas`, response)),
      catchError(this.handleError<Audit[]>('getEmployeeAudits'))
    );
  }

  /**
   * Actualiza un empleado existente.
   * @param employeeId ID del empleado a actualizar.
   * @param payload Datos actualizados del empleado.
   * @returns Observable con la respuesta del servidor.
   */
  public updateEmployee(employeeId: number, payload: EmployeeUpdate): Observable<EmployeeResponse> {
    const endpoint = `${EMPLOYEE_ENDPOINTS.UPDATE}/${employeeId}`;
    return this.apiService.put<EmployeeResponse, EmployeeUpdate>(endpoint, payload).pipe(
      tap(response => this.logger.debug(`Empleado con ID ${employeeId} actualizado`, response)),
      catchError(this.handleError<EmployeeResponse>('updateEmployee'))
    );
  }

  /**
   * Elimina un empleado.
   * @param employeeId ID del empleado a eliminar.
   * @returns Observable que completa al eliminar.
   */
  public deleteEmployee(employeeId: number): Observable<void> {
    const endpoint = `${EMPLOYEE_ENDPOINTS.DELETE}/${employeeId}`;
    return this.apiService.delete<void>(endpoint).pipe(
      tap(() => this.logger.debug(`Empleado con ID ${employeeId} eliminado`)),
      catchError(this.handleError<void>('deleteEmployee'))
    );
  }

  /**
   * Maneja errores de las operaciones.
   * @param operation Nombre de la operación que falló.
   * @returns Función que maneja el error y devuelve un Observable con el error.
   */
  private handleError<T>(operation: string) {
    return (error: any): Observable<T> => {
      this.logger.error(`Error en ${operation}`, error);
      return throwError(() => new Error(`Error en la operación ${operation}`));
    };
  }
}
