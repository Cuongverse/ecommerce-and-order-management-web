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

// true  = fake backend: every page works with sample data, you are "logged in" as an admin
// false = the real backend
const MOCK_MODE = false;

// folder that api.js lives in, so links work from any page (also from /products/)
const ROOT = new URL(".", document.currentScript.src).href;

/* ---------- token storage ---------- */
const Auth = {
    getToken()  { return localStorage.getItem(TOKEN_KEY); },
    setToken(t) { localStorage.setItem(TOKEN_KEY, t); },
    clear()     { localStorage.removeItem(TOKEN_KEY); },
    isLoggedIn() { return MOCK_MODE || !!localStorage.getItem(TOKEN_KEY); },

    // the token contains the user's email; read it without asking the backend
    emailFromToken() {
        if (MOCK_MODE) return "demo@giftcard.com";
        try {
            const payload = this.getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(payload)).email || "";
        } catch { return ""; }
    },

    // the token also lists the user's roles, e.g. "ROLE_ADMIN"
    isAdmin() {
        if (MOCK_MODE) return true;
        try {
            const payload = this.getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return String(JSON.parse(atob(payload)).authorities || "").split(",").includes("ROLE_ADMIN");
        } catch { return false; }
    },
};

/* ---------- the one function every page uses to call the backend ----------
   apiFetch("/api/products")
   apiFetch("/auth/login", { method: "POST", body: { email, password } })
   Returns the parsed JSON. On failure it throws an Error with a readable message. */
async function apiFetch(path, options = {}) {
    if (MOCK_MODE) return mockApi(path, options);

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

    // only admins see the Admin link
    if (!Auth.isAdmin()) {
        document.querySelectorAll('nav a[href$="admin.html"]').forEach(a => {
            const li = a.closest("li");
            if (li) li.style.display = "none";
        });
    }

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


/* =========================================================
   MOCK MODE - a fake backend, only used when MOCK_MODE = true
   Your changes (cart, orders, products, reviews...) are kept in localStorage under "mockdb".
   To start from scratch, run this in the browser console:  localStorage.removeItem("mockdb")
   ========================================================= */
const MOCK_KEY = "mockdb";

function mockSeed() {
    const iso = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 19);
    const me = { id: 1, firstName: "Demo", lastName: "Customer", email: "demo@giftcard.com" };
    const lan = { id: 2, firstName: "Lan", lastName: "Pham", email: "lan@example.com" };

    const mk = (id, title, price, disc, cat, desc, sizes) => ({
        id, title, description: desc, price, discountedPrice: disc,
        discountedPercent: Math.round((1 - disc / price) * 100), quantity: 50,
        brand: title.split(" ")[0], color: "", sizes, imageUrl: "", numRatings: 0,
        category: { name: cat }, ratings: [], reviews: [],
    });
    const products = [
        mk(1, "Netflix Gift Card", 25, 24, "Streaming", "Redeem on netflix.com/redeem to add credit.\nCredit is applied to your next bill.", [{ name: "$25", quantity: 20 }, { name: "$50", quantity: 10 }]),
        mk(2, "Spotify Premium Card", 10, 10, "Streaming", "Add Premium time to your Spotify account.", []),
        mk(3, "Steam Wallet Card - USD", 20, 19, "Gaming", "US-region Steam wallet codes, delivered instantly.", [{ name: "$20", quantity: 30 }, { name: "$50", quantity: 0 }]),
        mk(4, "Amazon Gift Card", 100, 97, "Shopping", "Use on Amazon for millions of items.", []),
        mk(5, "PlayStation Store Card", 60, 55, "Gaming", "Top up your PlayStation wallet.", []),
        mk(6, "Starbucks Voucher", 15, 12, "Food & Drink", "Valid at all Starbucks stores.", []),
    ];
    products[0].ratings = [{ id: 1, user: me, rating: 5 }, { id: 2, user: lan, rating: 4 }];
    products[0].numRatings = 2;
    products[0].reviews = [
        { id: 1, review: "Code arrived in seconds, easy to redeem.", user: me, createdAt: iso(2) },
        { id: 2, review: "Good price, will buy again.", user: lan, createdAt: iso(5) },
    ];

    const addr = { id: 1, firstName: "Demo", lastName: "Customer", streetAddress: "1 Dai Co Viet", city: "Hanoi", province: "Hanoi", zipCode: "100000", mobile: "0900000000" };
    const line = (id, p, size, qty) => ({ id, product: p, size, quantity: qty, price: p.price * qty, discountedPrice: p.discountedPrice * qty });
    const order = (id, status, days, items) => ({
        id, orderStatus: status, user: me, orderItems: items, orderDate: iso(days), createdAt: iso(days),
        shippingAddress: addr, paymenDetails: { status: status === "PENDING" ? "PENDING" : "COMPLETED" },
        totalPrice: items.reduce((s, i) => s + i.price, 0),
        totalDiscountedPrice: items.reduce((s, i) => s + i.discountedPrice, 0),
        discount: items.reduce((s, i) => s + i.price - i.discountedPrice, 0),
        totalItem: items.reduce((s, i) => s + i.quantity, 0),
    });
    const orders = [
        order(1, "DELIVERED", 12, [line(1, products[0], "$25", 1)]),
        order(2, "DELIVERED", 9, [line(2, products[2], "$20", 2), line(3, products[1], "", 1)]),
        order(3, "SHIPPED", 3, [line(4, products[3], "", 1)]),
        order(4, "CONFIRMED", 1, [line(5, products[4], "", 1)]),
        order(5, "PENDING", 0, [line(6, products[5], "", 2)]),
        order(6, "CANCELLED", 7, [line(7, products[1], "", 1)]),
    ];
    return { products, orders, cart: [{ id: 1, productId: 3, size: "$20", quantity: 2 }], seq: {} };
}

function mockLoad() {
    try {
        const d = JSON.parse(localStorage.getItem(MOCK_KEY));
        if (d && d.products) return d;
    } catch {}
    const d = mockSeed();
    localStorage.setItem(MOCK_KEY, JSON.stringify(d));
    return d;
}

async function mockApi(path, options) {
    await new Promise(r => setTimeout(r, 120));                       // feel like a real request

    const method = (options.method || "GET").toUpperCase();
    const body = typeof options.body === "string" ? JSON.parse(options.body) : (options.body || {});
    const [pathname, query = ""] = path.split("?");
    const q = new URLSearchParams(query);
    const db = mockLoad();
    const save = value => { localStorage.setItem(MOCK_KEY, JSON.stringify(db)); return value; };
    const next = key => (db.seq[key] = (db.seq[key] || 100) + 1);
    const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
    const prod = id => db.products.find(p => p.id === Number(id)) || fail(404, "Product Not Found With Id - " + id);
    const ord = id => db.orders.find(o => o.id === Number(id)) || fail(404, "Order Not Found With Id - " + id);
    const me = { id: 1, firstName: "Demo", lastName: "Customer", email: "demo@giftcard.com" };
    const ok = message => ({ message, status: true });

    const cartOut = () => {
        const cartItems = db.cart.map(c => {
            const p = prod(c.productId);
            return { id: c.id, product: p, size: c.size, quantity: c.quantity, userId: 1,
                     price: p.price * c.quantity, discountedPrice: p.discountedPrice * c.quantity };
        });
        const totalPrice = cartItems.reduce((s, i) => s + i.price, 0);
        const totalDiscountedPrice = cartItems.reduce((s, i) => s + i.discountedPrice, 0);
        return { id: 1, cartItems, totalPrice, totalDiscountedPrice, discount: totalPrice - totalDiscountedPrice,
                 totalItem: cartItems.reduce((s, i) => s + i.quantity, 0) };
    };

    let r;

    /* ----- auth + profile ----- */
    if (method === "POST" && /^\/auth\/(login|signup)$/.test(pathname)) return { jwt: "mock.token.value", message: "Mock login" };
    if (method === "GET" && pathname === "/api/users/profile") return { ...me, role: "ROLE_ADMIN" };

    /* ----- products ----- */
    if (method === "GET" && pathname === "/api/products") {
        let list = [...db.products];
        if (q.get("minPrice")) list = list.filter(p => p.discountedPrice >= Number(q.get("minPrice")));
        if (q.get("maxPrice")) list = list.filter(p => p.discountedPrice <= Number(q.get("maxPrice")));
        if (q.get("sort") === "price_low") list.sort((a, b) => a.discountedPrice - b.discountedPrice);
        if (q.get("sort") === "price_high") list.sort((a, b) => b.discountedPrice - a.discountedPrice);
        return { content: list, totalElements: list.length };
    }
    if (method === "GET" && (r = pathname.match(/^\/api\/products\/id\/(\d+)$/))) return prod(r[1]);

    /* ----- ratings + reviews ----- */
    if (method === "GET" && (r = pathname.match(/^\/api\/reviews\/product\/(\d+)$/))) return prod(r[1]).reviews;
    if (method === "GET" && (r = pathname.match(/^\/api\/ratings\/product\/(\d+)$/))) return prod(r[1]).ratings;
    if (method === "POST" && pathname === "/api/ratings/create") {
        const p = prod(body.productId);
        const mine = p.ratings.find(x => x.user.id === 1);              // one rating per user, like the real backend should
        if (mine) mine.rating = body.rating;
        else { p.ratings.push({ id: next("rating"), user: me, rating: body.rating }); p.numRatings++; }
        return save({ rating: body.rating });
    }
    if (method === "POST" && pathname === "/api/reviews/create") {
        const review = { id: next("review"), review: body.review, user: me, createdAt: new Date().toISOString().slice(0, 19) };
        prod(body.productId).reviews.push(review);
        return save(review);
    }

    /* ----- cart ----- */
    if (method === "GET" && pathname === "/api/cart") return cartOut();
    if (method === "PUT" && pathname === "/api/cart/add") {
        prod(body.productId);
        const size = body.size || "";
        const same = db.cart.find(c => c.productId === Number(body.productId) && c.size === size);
        if (same) same.quantity += body.quantity || 1;
        else db.cart.push({ id: next("cart"), productId: Number(body.productId), size, quantity: body.quantity || 1 });
        return save(ok("item added to cart"));
    }
    if (method === "PUT" && (r = pathname.match(/^\/api\/cart_items\/update\/(\d+)$/))) {
        const c = db.cart.find(x => x.id === Number(r[1])) || fail(404, "Cart Item Not Found With ID - " + r[1]);
        c.quantity = body.quantity; c.size = body.size || "";
        return save({ id: c.id, quantity: c.quantity, size: c.size });
    }
    if (method === "DELETE" && (r = pathname.match(/^\/api\/cart_items\/delete\/(\d+)$/))) {
        db.cart = db.cart.filter(x => x.id !== Number(r[1]));
        return save(ok("Cart Item Deleted Successfully"));
    }

    /* ----- customer orders ----- */
    if (method === "POST" && pathname === "/api/orders") {
        const cart = cartOut();
        if (!cart.cartItems.length) fail(400, "Your cart is empty.");
        const o = {
            id: db.orders.reduce((m, x) => Math.max(m, x.id), 0) + 1, orderStatus: "PENDING", user: me,
            orderItems: cart.cartItems.map(i => ({ ...i, id: next("orderitem") })),
            orderDate: new Date().toISOString().slice(0, 19), createdAt: new Date().toISOString().slice(0, 19),
            shippingAddress: { id: next("addr"), ...body }, paymenDetails: { status: "PENDING" },
            totalPrice: cart.totalPrice, totalDiscountedPrice: cart.totalDiscountedPrice, discount: cart.discount, totalItem: cart.totalItem,
        };
        db.orders.push(o);
        db.cart = [];                                                   // an order empties the cart
        return save(o);
    }
    if (method === "GET" && pathname === "/api/orders/user") return db.orders;
    if (method === "GET" && (r = pathname.match(/^\/api\/orders\/(\d+)$/))) return ord(r[1]);

    /* ----- admin: orders ----- */
    if (method === "GET" && pathname === "/api/admin/orders") return db.orders;
    if (method === "PUT" && (r = pathname.match(/^\/api\/admin\/orders\/(\d+)\/(confirmed|ship|deliver|cancel)$/))) {
        const o = ord(r[1]);
        o.orderStatus = { confirmed: "CONFIRMED", ship: "SHIPPED", deliver: "DELIVERED", cancel: "CANCELLED" }[r[2]];
        return save(o);
    }
    if (method === "DELETE" && (r = pathname.match(/^\/api\/admin\/orders\/(\d+)\/delete$/))) {
        ord(r[1]);
        db.orders = db.orders.filter(o => o.id !== Number(r[1]));
        return save(ok("Order Deleted Successfully"));
    }

    /* ----- admin: products ----- */
    if (method === "GET" && pathname === "/api/admin/products/all") return db.products;
    if (method === "POST" && pathname === "/api/admin/products") {
        const p = {
            id: db.products.reduce((m, x) => Math.max(m, x.id), 0) + 1,
            title: body.title, description: body.description, price: body.price, discountedPrice: body.discountedPrice,
            discountedPercent: body.discountedPercent, quantity: body.quantity, brand: body.brand, color: body.color,
            sizes: body.size || [], imageUrl: body.imageUrl, numRatings: 0,
            category: { name: body.thirdLevelCategory }, ratings: [], reviews: [],
        };
        db.products.push(p);
        return save(p);
    }
    if (method === "PUT" && (r = pathname.match(/^\/api\/admin\/products\/(\d+)\/update$/))) {
        const p = prod(r[1]);
        ["title", "description", "price", "discountedPrice", "discountedPercent", "quantity", "brand", "color", "sizes", "imageUrl"]
            .forEach(k => { if (body[k] !== undefined) p[k] = body[k]; });
        return save(p);
    }
    if (method === "DELETE" && (r = pathname.match(/^\/api\/admin\/products\/(\d+)\/delete$/))) {
        prod(r[1]);
        db.products = db.products.filter(p => p.id !== Number(r[1]));
        return save(ok("Product Deleted Successfully"));
    }

    fail(404, "The mock backend has no route for " + method + " " + pathname);
}

// a small reminder so you never forget the data is fake
if (MOCK_MODE) {
    document.addEventListener("DOMContentLoaded", () => {
        const tag = document.createElement("div");
        tag.textContent = "MOCK MODE: fake data";
        tag.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:9999;padding:6px 12px;border-radius:20px;" +
                            "background:#ffc107;color:#1a1450;font:600 12px sans-serif;pointer-events:none;opacity:.9";
        document.body.appendChild(tag);
    });
}