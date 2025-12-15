// client/src/config.js

// flexible switch:
// If we are building for production (Google), use relative path ('')
// If we are in dev mode (Laptop), use localhost
const isProduction = import.meta.env.MODE === 'production';

export const API_URL = isProduction ? '' : 'http://localhost:3000';