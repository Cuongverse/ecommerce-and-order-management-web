/*
 * Frontend configuration.
 *
 * Leave API_BASE empty to use the defaults in api.js:
 *   - Local development (localhost / 127.0.0.1): http://localhost:5432
 *   - A frontend deployed on the same origin as the backend: current origin
 *
 * When frontend and backend are hosted separately, set API_BASE to the backend
 * origin, for example: https://api.example.com (no trailing slash required).
 */
window.APP_CONFIG = Object.assign({
    API_BASE: ''
}, window.APP_CONFIG || {});
