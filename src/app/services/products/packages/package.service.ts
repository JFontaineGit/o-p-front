import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { LoggerService } from '../../core/logger.service';
import { PackageCreate, PackageUpdate, PackageResponse, PackageDetailResponse, ComponentPackageCreate, ComponentPackageUpdate, ComponentPackageResponse, PackageSearchParams } from '../../interfaces/package.interfaces';
import { PACKAGE_ENDPOINTS } from './package-endpoints';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiService = inject(ApiService);
  private logger = inject(LoggerService);

  constructor() { }

  /** 
   * Retrieves the list of all packages.
   * @returns Observable with the list of packages.
   */
  public listPackages(): Observable<PackageResponse[]> {
    return this.apiService.get<PackageResponse[]>(PACKAGE_ENDPOINTS.LIST).pipe(
      tap(response => this.logger.debug('Lista de paquetes obtenida', response)),
      catchError(this.handleError<PackageResponse[]>('listPackages'))
    );
  }

  /** 
   * Creates a new package.
   * @param payload Data of the package to create.
   * @returns Observable with the server response.
   */
  public createPackage(payload: PackageCreate): Observable<PackageResponse> {
    return this.apiService.post<PackageResponse, PackageCreate>(PACKAGE_ENDPOINTS.CREATE, payload).pipe(
      tap(response => this.logger.debug('Paquete creado exitosamente', response)),
      catchError(this.handleError<PackageResponse>('createPackage'))
    );
  }

  /** 
   * Retrieves a package by its ID.
   * @param packageId ID of the package.
   * @returns Observable with the detailed package data.
   */
  public getPackage(packageId: number): Observable<PackageDetailResponse> {
    const endpoint = PACKAGE_ENDPOINTS.GET.replace('{package_id}', packageId.toString());
    return this.apiService.get<PackageDetailResponse>(endpoint).pipe(
      tap(response => this.logger.debug(`Paquete con ID ${packageId} obtenido`, response)),
      catchError(this.handleError<PackageDetailResponse>('getPackage'))
    );
  }

  /** 
   * Updates an existing package.
   * @param packageId ID of the package to update.
   * @param payload Updated package data.
   * @returns Observable with the server response.
   */
  public updatePackage(packageId: number, payload: PackageUpdate): Observable<PackageResponse> {
    const endpoint = PACKAGE_ENDPOINTS.UPDATE.replace('{package_id}', packageId.toString());
    return this.apiService.put<PackageResponse, PackageUpdate>(endpoint, payload).pipe(
      tap(response => this.logger.debug(`Paquete con ID ${packageId} actualizado`, response)),
      catchError(this.handleError<PackageResponse>('updatePackage'))
    );
  }

  /** 
   * Deletes a package.
   * @param packageId ID of the package to delete.
   * @returns Observable with the server response.
   */
  public deletePackage(packageId: number): Observable<void> {
    const endpoint = PACKAGE_ENDPOINTS.DELETE.replace('{package_id}', packageId.toString());
    return this.apiService.delete<void>(endpoint).pipe(
      tap(() => this.logger.debug(`Paquete con ID ${packageId} eliminado`)),
      catchError(this.handleError<void>('deletePackage'))
    );
  }

  /** 
   * Retrieves the list of components of a package.
   * @param packageId ID of the package.
   * @returns Observable with the list of components.
   */
  public listPackageComponents(packageId: number): Observable<ComponentPackageResponse[]> {
    const endpoint = PACKAGE_ENDPOINTS.COMPONENTS_LIST.replace('{package_id}', packageId.toString());
    return this.apiService.get<ComponentPackageResponse[]>(endpoint).pipe(
      tap(response => this.logger.debug(`Componentes del paquete con ID ${packageId} obtenidos`, response)),
      catchError(this.handleError<ComponentPackageResponse[]>('listPackageComponents'))
    );
  }

  /** 
   * Creates a new component for a package.
   * @param packageId ID of the package.
   * @param payload Data of the component to create.
   * @returns Observable with the server response.
   */
  public createPackageComponent(packageId: number, payload: ComponentPackageCreate): Observable<ComponentPackageResponse> {
    const endpoint = PACKAGE_ENDPOINTS.COMPONENTS_CREATE.replace('{package_id}', packageId.toString());
    return this.apiService.post<ComponentPackageResponse, ComponentPackageCreate>(endpoint, payload).pipe(
      tap(response => this.logger.debug(`Componente creado para el paquete con ID ${packageId}`, response)),
      catchError(this.handleError<ComponentPackageResponse>('createPackageComponent'))
    );
  }

  /** 
   * Updates a component of a package.
   * @param packageId ID of the package.
   * @param componentId ID of the component.
   * @param payload Updated component data.
   * @returns Observable with the server response.
   */
  public updatePackageComponent(packageId: number, componentId: number, payload: ComponentPackageUpdate): Observable<ComponentPackageResponse> {
    const endpoint = PACKAGE_ENDPOINTS.COMPONENTS_UPDATE.replace('{package_id}', packageId.toString()).replace('{component_id}', componentId.toString());
    return this.apiService.put<ComponentPackageResponse, ComponentPackageUpdate>(endpoint, payload).pipe(
      tap(response => this.logger.debug(`Componente con ID ${componentId} del paquete con ID ${packageId} actualizado`, response)),
      catchError(this.handleError<ComponentPackageResponse>('updatePackageComponent'))
    );
  }

  /** 
   * Deletes a component of a package.
   * @param packageId ID of the package.
   * @param componentId ID of the component.
   * @returns Observable with the server response.
   */
  public deletePackageComponent(packageId: number, componentId: number): Observable<void> {
    const endpoint = PACKAGE_ENDPOINTS.COMPONENTS_DELETE.replace('{package_id}', packageId.toString()).replace('{component_id}', componentId.toString());
    return this.apiService.delete<void>(endpoint).pipe(
      tap(() => this.logger.debug(`Componente con ID ${componentId} del paquete con ID ${packageId} eliminado`)),
      catchError(this.handleError<void>('deletePackageComponent'))
    );
  }

  /** 
   * Retrieves the list of featured packages.
   * @returns Observable with the list of featured packages.
   */
  public searchFeaturedPackages(): Observable<PackageResponse[]> {
    return this.apiService.get<PackageResponse[]>(PACKAGE_ENDPOINTS.SEARCH_FEATURED).pipe(
      tap(response => this.logger.debug('Paquetes destacados obtenidos', response)),
      catchError(this.handleError<PackageResponse[]>('searchFeaturedPackages'))
    );
  }

  /** 
   * Searches for packages within a price range.
   * @param minPrice Minimum price.
   * @param maxPrice Maximum price.
   * @returns Observable with the list of packages within the range.
   */
  public searchPackagesByPriceRange(minPrice: number, maxPrice: number): Observable<PackageResponse[]> {
    const params = new HttpParams().set('min_price', minPrice.toString()).set('max_price', maxPrice.toString());
    return this.apiService.get<PackageResponse[]>(PACKAGE_ENDPOINTS.SEARCH_BY_PRICE_RANGE, { params }).pipe(
      tap(response => this.logger.debug(`Paquetes en rango de precios [${minPrice}, ${maxPrice}] obtenidos`, response)),
      catchError(this.handleError<PackageResponse[]>('searchPackagesByPriceRange'))
    );
  }

  /** 
   * Searches for packages within a duration range.
   * @param minDuration Minimum duration in days.
   * @param maxDuration Maximum duration in days.
   * @returns Observable with the list of packages within the range.
   */
  public searchPackagesByDuration(minDuration: number, maxDuration: number): Observable<PackageResponse[]> {
    const params = new HttpParams().set('min_duration', minDuration.toString()).set('max_duration', maxDuration.toString());
    return this.apiService.get<PackageResponse[]>(PACKAGE_ENDPOINTS.SEARCH_BY_DURATION, { params }).pipe(
      tap(response => this.logger.debug(`Paquetes en rango de duración [${minDuration}, ${maxDuration}] días obtenidos`, response)),
      catchError(this.handleError<PackageResponse[]>('searchPackagesByDuration'))
    );
  }

  /** 
   * Retrieves an overview of package statistics.
   * @returns Observable with the statistics.
   */
  public getPackagesStatsOverview(): Observable<any> {
    return this.apiService.get<any>(PACKAGE_ENDPOINTS.STATS_OVERVIEW).pipe(
      tap(response => this.logger.debug('Estadísticas de paquetes obtenidas', response)),
      catchError(this.handleError('getPackagesStatsOverview'))
    );
  }

  /** 
   * Retrieves the list of packages for a specific category.
   * @param categoryId ID of the category.
   * @returns Observable with the list of packages for the category.
   */
  public getCategoryPackages(categoryId: number): Observable<PackageResponse[]> {
    const endpoint = PACKAGE_ENDPOINTS.CATEGORY_PACKAGES.replace('{category_id}', categoryId.toString());
    return this.apiService.get<PackageResponse[]>(endpoint).pipe(
      tap(response => this.logger.debug(`Paquetes de la categoría con ID ${categoryId} obtenidos`, response)),
      catchError(this.handleError<PackageResponse[]>('getCategoryPackages'))
    );
  }

  /** 
   * Handles errors for operations.
   * @param operation Name of the operation that failed.
   * @returns Function that handles the error and returns an Observable with the error.
   */
  private handleError<T>(operation: string) {
    return (error: any): Observable<T> => {
      this.logger.error(`Error en ${operation}`, error);
      return throwError(() => new Error(`Error en la operación ${operation}: ${error.message}`));
    };
  }
}