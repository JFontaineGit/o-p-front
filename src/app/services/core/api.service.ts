import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, shareReplay, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

/**
 * Service to handle HTTP and WebSocket requests to a Django Ninja backend API.
 * Dynamically constructs URLs with a UUID prefix fetched from the backend.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly baseWsUrl = environment.wsBaseUrl;
  private readonly uuidSubject = new ReplaySubject<string>(1);
  private readonly uuid$ = this.uuidSubject.asObservable();
  private uuidLoaded$!: Observable<string>;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.fetchUuid();
  }

  /**
   * Fetches the UUID prefix from the backend and updates the ReplaySubject.
   * Caches the result to avoid multiple requests.
   * 
   * @throws Error if the UUID is invalid or the request fails after retries.
   */
  private fetchUuid(): void {
    this.uuidLoaded$ = this.http
      .get<{ id_prefix_api_secret: string }>(`${this.baseUrl}/id_prefix_api_secret/`)
      .pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay }),
        tap((response) => {
          const uuid = response.id_prefix_api_secret;
          if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
            throw new Error('UUID inválido recibido del servidor');
          }
          this.logger.debug('UUID fetched', { uuid });
          this.uuidSubject.next(uuid);
        }),
        map((response) => response.id_prefix_api_secret),
        catchError((err) => {
          this.logger.error('Error fetching UUID', err);
          return throwError(() => new Error('No se pudo cargar el UUID de la API'));
        }),
        shareReplay(1)
      );

    // Subscribe to ensure the UUID is fetched immediately
    this.uuidLoaded$.subscribe({
      error: (err) => this.logger.error('UUID loading failed', err),
    });
  }

  /**
   * Builds the full URL for an API endpoint, including the UUID prefix.
   * 
   * @param endpoint The API endpoint.
   * @returns Observable of the constructed URL.
   * @throws Error if the UUID is not available.
   */
  private buildUrl(endpoint: string): Observable<string> {
    return this.uuidLoaded$.pipe(
      map((uuid) => {
        const cleanEndpoint = endpoint.replace(/^\/+/, '');
        return `${this.baseUrl}/${uuid}/${cleanEndpoint}`;
      }),
      catchError((err) => {
        this.logger.error('Error building URL', err);
        return throwError(() => new Error('Error al construir la URL de la API'));
      })
    );
  }

  /**
   * Builds the full URL for a WebSocket endpoint, including the UUID prefix.
   * 
   * @param endpoint The WebSocket endpoint.
   * @returns Observable of the constructed WebSocket URL.
   * @throws Error if the UUID is not available.
   */
  public buildWsUrl(endpoint: string): Observable<string> {
    return this.uuidLoaded$.pipe(
      map((uuid) => {
        const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
        return `${this.baseWsUrl}/${uuid}/${cleanEndpoint}`;
      }),
      catchError((err) => {
        this.logger.error('Error building WebSocket URL', err);
        return throwError(() => new Error('Error al construir la URL de WebSocket'));
      })
    );
  }

  generateUUIDv4() {
    return crypto.randomUUID();
  }

  /**
   * Performs a GET request to the specified endpoint.
   * 
   * @param endpoint The API endpoint.
   * @param options Optional HTTP options (e.g., query parameters).
   * @returns Observable of the response data.
   * @throws Error if the request fails.
   */
  get<T>(endpoint: string, options?: { params?: HttpParams, headers?: HttpHeaders }): Observable<T> {
    return this.buildUrl(endpoint).pipe(
      switchMap((url) => this.http.get<T>(url, options).pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay })
      )),
      catchError((err) => {
        this.logger.error(`Error in GET ${endpoint}`, err);
        return throwError(() => new Error(`Error al obtener datos de ${endpoint}`));
      })
    );
  }

  /**
   * Performs a POST request to the specified endpoint.
   * 
   * @param endpoint The API endpoint.
   * @param payload The request body.
   * @param options Optional HTTP options (e.g., query parameters).
   * @returns Observable of the response data.
   * @throws Error if the request fails.
   */
  post<T, P = unknown>(endpoint: string, payload: P, options?: { params?: HttpParams, headers?: HttpHeaders }): Observable<T> {
    return this.buildUrl(endpoint).pipe(
      switchMap((url) => this.http.post<T>(url, payload, options).pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay })
      )),
      catchError((err) => {
        this.logger.error(`Error in POST ${endpoint}`, err);
        return throwError(() => new Error(`Error al enviar datos a ${endpoint}`));
      })
    );
  }

  /**
   * Performs a PUT request to the specified endpoint.
   * 
   * @param endpoint The API endpoint.
   * @param payload The request body.
   * @param options Optional HTTP options (e.g., query parameters).
   * @returns Observable of the response data.
   * @throws Error if the request fails.
   */
  put<T, P = unknown>(endpoint: string, payload: P, options?: { params?: HttpParams }): Observable<T> {
    return this.buildUrl(endpoint).pipe(
      switchMap((url) => this.http.put<T>(url, payload, options).pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay })
      )),
      catchError((err) => {
        this.logger.error(`Error in PUT ${endpoint}`, err);
        return throwError(() => new Error(`Error al actualizar datos en ${endpoint}`));
      })
    );
  }

  /**
   * Performs a DELETE request to the specified endpoint.
   * 
   * @param endpoint The API endpoint.
   * @param options Optional HTTP options (e.g., query parameters).
   * @returns Observable of the response data.
   * @throws Error if the request fails.
   */
  delete<T>(endpoint: string, options?: { params?: HttpParams }): Observable<T> {
    return this.buildUrl(endpoint).pipe(
      switchMap((url) => this.http.delete<T>(url, options).pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay })
      )),
      catchError((err) => {
        this.logger.error(`Error in DELETE ${endpoint}`, err);
        return throwError(() => new Error(`Error al eliminar datos en ${endpoint}`));
      })
    );
  }

  /**
   * Performs a PATCH request to the specified endpoint.
   * 
   * @param endpoint The API endpoint.
   * @param payload The request body.
   * @param options Optional HTTP options (e.g., query parameters).
   * @returns Observable of the response data.
   * @throws Error if the request fails.
   */
  patch<T, P = unknown>(endpoint: string, payload: P, options?: { params?: HttpParams }): Observable<T> {
    return this.buildUrl(endpoint).pipe(
      switchMap((url) => this.http.patch<T>(url, payload, options).pipe(
        timeout(environment.apiTimeout),
        retry({ count: environment.retryAttempts, delay: environment.retryDelay })
      )),
      catchError((err) => {
        this.logger.error(`Error in PATCH ${endpoint}`, err);
        return throwError(() => new Error(`Error al modificar datos en ${endpoint}`));
      })
    );
  }
}