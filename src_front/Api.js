/* =========================================================
   api.js - shared by every page.
   1. apiFetch()      talks to the backend and attaches your login token
   2. Auth            saves / reads / clears the token in the browser
   3. renderAuthNav() shows "Hi, name | Logout" in the navbar

   Load it BEFORE your page's own script:
     site.html           <script src="api.js"></script>
     products/products.html  <script src="../api.js"></script>
   ========================================================= */

const API_BASE = "http://localhost:5432";
const TOKEN_KEY = "jwt";

// folder that api.js lives in, so links work from any page (also from /products/)
const ROOT = new URL(".", document.currentScript.src).href;

/* ---------- token storage ---------- */
const Auth = {
    getToken()  { return localStorage.getItem(TOKEN_KEY); },
    setToken(t) { localStorage.setItem(TOKEN_KEY, t); },
    clear()     { localStorage.removeItem(TOKEN_KEY); },
    isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },

    // the token contains the user's email; read it without asking the backend
    emailFromToken() {
        try {
            const payload = this.getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(payload)).email || "";
        } catch { return ""; }
    },
};

/* ---------- the one function every page uses to call the backend ----------
   apiFetch("/api/products")
   apiFetch("/auth/login", { method: "POST", body: { email, password } })
   Returns the parsed JSON. On failure it throws an Error with a readable message. */
async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    let body = options.body;

    if (body !== undefined && typeof body !== "string") {
        body = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
    }

    // login/signup must NOT send an old token (the backend rejects expired ones)
    const token = Auth.getToken();
    if (token && !path.startsWith("/auth/")) {
        headers.Authorization = "Bearer " + token;
    }

    let res;
    try {
        res = await fetch(API_BASE + path, { ...options, headers, body });
    } catch {
        throw new Error("Cannot reach the server. Is the backend running?");
    }

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
        const err = new Error((data && data.message) || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

/* ---------- navbar: avatar -> login page, or "Hi, name | Logout" ---------- */
function renderAuthNav() {
    const actions = document.querySelector(".nav-actions");
    const avatar = document.querySelector(".avatar-btn");
    if (!actions || !avatar) return;

    // the cart icon opens the cart page
    const cartBtn = document.querySelector('.icon-btn[aria-label="Cart"]');
    if (cartBtn) cartBtn.addEventListener("click", () => { location.href = ROOT + "cart.html"; });

    const style = document.createElement("style");
    style.textContent = `
        .nav-user{ color:#e6e4ff; font-size:14px; white-space:nowrap; }
        .nav-logout{ padding:8px 16px; border:1px solid rgba(255,255,255,.35); border-radius:30px;
                     background:transparent; color:#fff; font-family:inherit; font-size:13px; cursor:pointer; }
        .nav-logout:hover{ background:#ff523b; border-color:#ff523b; }`;
    document.head.appendChild(style);

    if (!Auth.isLoggedIn()) {
        avatar.addEventListener("click", () => { location.href = ROOT + "auth.html"; });
        return;
    }

    const label = document.createElement("span");
    label.className = "nav-user";
    label.textContent = "Hi, " + (Auth.emailFromToken() || "there");

    const logout = document.createElement("button");
    logout.className = "nav-logout";
    logout.type = "button";
    logout.textContent = "Log out";
    logout.addEventListener("click", () => { Auth.clear(); location.href = ROOT + "site.html"; });

    avatar.after(label, logout);
    avatar.addEventListener("click", () => {});   // already logged in: nothing to open yet

    // upgrade the label to the real first name once the backend answers
    apiFetch("/api/users/profile")
        .then(u => { if (u && u.firstName) label.textContent = "Hi, " + u.firstName; })
        .catch(() => {});   // keep the email if the profile call fails
}

document.addEventListener("DOMContentLoaded", renderAuthNav);