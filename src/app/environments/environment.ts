export const environment = {
  production: false,
  apiBaseUrl: process.env['API_BASE_URL'] || 'http://127.0.0.1:8080',
  wsBaseUrl: process.env['WS_BASE_URL'] || 'ws://127.0.0.1:8080',
  apiTimeout: parseInt(process.env['API_TIMEOUT'] || '10000', 10),
  retryAttempts: parseInt(process.env['RETRY_ATTEMPTS'] || '3', 10),
  retryDelay: parseInt((process.env['RETRY_DELAY'] ?? '1000'), 10)
};