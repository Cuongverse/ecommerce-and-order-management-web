/*
 * Shared browser API client.
 * Load config.js immediately before this file on every page.
 * Provides: apiFetch(), Auth, ROOT and renderAuthNav().
 */
(function initialiseApiClient() {
    'use strict';

    const scriptUrl = document.currentScript && document.currentScript.src
        ? document.currentScript.src
        : window.location.href;
    const ROOT = new URL('.', scriptUrl).href;
    const configuredBase = String((window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '').trim();
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
    const isLocal = window.location.protocol === 'file:' || localHosts.has(window.location.hostname);
    const defaultBase = isLocal ? 'http://localhost:5432' : window.location.origin;
    const API_BASE = (configuredBase || defaultBase).replace(/\/+$/, '');
    const TOKEN_KEY = 'jwt';

    window.ROOT = ROOT;
    window.API_BASE = API_BASE;

    function readClaims(token) {
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const binary = window.atob(padded);
            const bytes = Array.from(binary, character => '%' + character.charCodeAt(0).toString(16).padStart(2, '0')).join('');
            return JSON.parse(decodeURIComponent(bytes));
        } catch (error) {
            console.warn('Could not decode the login token:', error);
            return null;
        }
    }

    const Auth = {
        getToken() {
            try { return window.localStorage.getItem(TOKEN_KEY); }
            catch { return null; }
        },
        setToken(token) {
            if (typeof token !== 'string' || !token.trim()) {
                throw new Error('The server returned an empty login token.');
            }
            try { window.localStorage.setItem(TOKEN_KEY, token); }
            catch { throw new Error('Your browser could not save the login token. Check its storage settings.'); }
        },
        clear() {
            try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* storage can be disabled */ }
        },
        claims() {
            return readClaims(this.getToken());
        },
        isLoggedIn() {
            const token = this.getToken();
            if (!token) return false;
            const claims = readClaims(token);
            if (!claims) return false;
            const expiry = Number(claims.exp);
            if (Number.isFinite(expiry) && expiry > 0 && expiry * 1000 <= Date.now()) {
                this.clear();
                return false;
            }
            return true;
        },
        emailFromToken() {
            const claims = this.claims();
            return claims ? String(claims.email || claims.sub || '') : '';
        },
        isAdmin() {
            const claims = this.claims();
            if (!claims) return false;
            const raw = claims.authorities || claims.roles || claims.role || [];
            const values = Array.isArray(raw) ? raw : String(raw).split(',');
            return values.some(value => {
                const role = typeof value === 'object' && value !== null
                    ? (value.authority || value.name || value.role || '')
                    : value;
                return String(role).trim().toUpperCase() === 'ROLE_ADMIN' || String(role).trim().toUpperCase() === 'ADMIN';
            });
        }
    };

    window.Auth = Auth;

    async function apiFetch(path, options = {}) {
        if (typeof path !== 'string' || !path.trim()) {
            throw new TypeError('apiFetch requires a non-empty API path.');
        }

        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        const url = /^https?:\/\//i.test(path) ? path : API_BASE + normalizedPath;
        const headers = new Headers(options.headers || {});
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        let body = options.body;
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
        const isSearchParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
        if (body !== undefined && body !== null && typeof body === 'object' && !isFormData && !isBlob && !isSearchParams) {
            body = JSON.stringify(body);
            if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        }

        const token = Auth.getToken();
        const isAuthRequest = /^\/?auth\//i.test(path);
        if (token && Auth.isLoggedIn() && !isAuthRequest && !headers.has('Authorization')) {
            headers.set('Authorization', 'Bearer ' + token);
        }

        let response;
        try {
            response = await window.fetch(url, { ...options, headers, body });
        } catch (networkError) {
            const detail = networkError && networkError.message ? ' (' + networkError.message + ')' : '';
            throw new Error(
                'Could not reach the backend at ' + API_BASE + '. Check that the backend is running and that its CORS settings allow this frontend.' + detail
            );
        }

        const raw = response.status === 204 ? '' : await response.text();
        let data = null;
        if (raw) {
            try { data = JSON.parse(raw); }
            catch { data = raw; }
        }

        if (response.status === 401) Auth.clear();
        if (!response.ok) {
            const message = typeof data === 'string'
                ? data
                : (data && (data.message || data.error || data.detail)) || ('Request failed (' + response.status + ')');
            const error = new Error(String(message));
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    }

    window.apiFetch = apiFetch;

    function renderAuthNav() {
        const actions = document.querySelector('.nav-actions');
        const avatar = document.querySelector('.avatar-btn');
        if (!actions || !avatar || actions.dataset.authNavReady === 'true') return;
        actions.dataset.authNavReady = 'true';

        const cartButton = document.querySelector('.icon-btn[aria-label="Cart"]');
        if (cartButton) {
            cartButton.addEventListener('click', () => { window.location.href = ROOT + 'Cart.html'; });
        }

        if (!Auth.isAdmin()) {
            document.querySelectorAll('nav a[href$="Admin.html"], nav a[href$="admin.html"]').forEach(link => {
                const item = link.closest('li');
                if (item) item.hidden = true;
            });
        }

        if (!document.getElementById('shared-auth-nav-style')) {
            const style = document.createElement('style');
            style.id = 'shared-auth-nav-style';
            style.textContent = `
                .nav-user{color:#e6e4ff;font-size:14px;white-space:nowrap;}
                .nav-logout{padding:8px 16px;border:1px solid rgba(255,255,255,.35);border-radius:30px;
                    background:transparent;color:#fff;font-family:inherit;font-size:13px;cursor:pointer;}
                .nav-logout:hover{background:#ff523b;border-color:#ff523b;}`;
            document.head.appendChild(style);
        }

        if (!Auth.isLoggedIn()) {
            avatar.addEventListener('click', () => { window.location.href = ROOT + 'Auth.html'; });
            return;
        }

        const label = document.createElement('span');
        label.className = 'nav-user';
        label.textContent = 'Hi, ' + (Auth.emailFromToken() || 'there');

        const logout = document.createElement('button');
        logout.type = 'button';
        logout.className = 'nav-logout';
        logout.textContent = 'Log out';
        logout.addEventListener('click', () => {
            Auth.clear();
            window.location.href = ROOT + 'site.html';
        });

        avatar.after(label, logout);
        avatar.setAttribute('aria-label', 'Profile (logged in)');
        avatar.addEventListener('click', event => event.preventDefault());

        // The JWT carries the email. Avoid the currently mismatched /api/users/profile route.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAuthNav, { once: true });
    } else {
        renderAuthNav();
    }
})();
