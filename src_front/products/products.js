/* 
   products.js - builds the product page.

   Where the product comes from:
   - products.html?id=12          -> backend  GET /api/products/id/12
   - products.html?id=netflix     -> sample data in ../data.js (the static cards on the home page)
 */
const $ = sel => document.querySelector(sel);

const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/* ----- automatic images -----
   1. a full https:// (or data:/absolute/../) link is used as-is
   2. a plain file name is looked up inside product_images/
   3. no img field at all -> product_images/<id>.png
   4. if that file doesn't exist, a gradient placeholder with initials is drawn  */
const IMG_DIR = '../product_images/';
const USD_RATE = 24000;

function toUsdValue(rawValue) {
    const parsed = Number(String(rawValue ?? '').replace(/[^0-9.-]+/g, ''));
    if (!Number.isFinite(parsed)) return null;
    return parsed > 1000 ? parsed / USD_RATE : parsed;
}

function normalizeImageSource(src) {
    if (!src) return null;
    const value = String(src).trim();
    if (!value) return null;
    if (/^(https?:|data:|\/)/.test(value) || value.startsWith('../')) return value;
    if (value.startsWith('product_images/') || value.startsWith('images/')) return `../${value}`;
    if (value.includes('/')) return `../${value}`;
    return `${IMG_DIR}${value}`;
}

function preferredLocalImageForName(name) {
    const text = String(name || '').toLowerCase();
    const mappings = [
        { keys: ['pubg'], file: 'Pubg.jpg' },
        { keys: ['genshin', 'genesis'], file: 'Genshin Impact.webp' },
        { keys: ['minecraft'], file: 'Minecraft.png' },
        { keys: ['mobile legends', 'mobile legend'], file: 'Mobile Legend.webp' },
        { keys: ['valorant', 'vp'], file: 'Valorant.webp' },
        { keys: ['free fire'], file: 'Free Fire.webp' },
        { keys: ['nintendo', 'eshop'], file: 'Nitendo.webp' },
        { keys: ['xbox', 'live'], file: 'Xbox.webp' },
        { keys: ['playstation'], file: 'PlayStation.webp' },
        { keys: ['steam'], file: 'Steam.webp' },
        { keys: ['roblox'], file: 'Roblox.webp' }
    ];

    const match = mappings.find(m => m.keys.some(key => text.includes(key)));
    return match ? `${IMG_DIR}${match.file}` : null;
}

// maintain Tuan's branch for because of better integration with backend
const imageFor = p => {
    const src = normalizeImageSource(p.img || p.imageUrl || p.image_url || `${p.id}.png`);
    return src || `${IMG_DIR}testing.png`;
};

function placeholder(name) {
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#ff523b"/><stop offset="1" stop-color="#3b6cff"/></linearGradient></defs>` +
        `<rect width="300" height="300" fill="url(#g)"/>` +
        `<text x="50%" y="54%" font-family="Arial, sans-serif" font-size="110" font-weight="700" ` +
        `fill="#fff" text-anchor="middle" dominant-baseline="middle">${esc(initials)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function imgTag(p, cls) {
    return `<img ${cls ? `class="${cls}" ` : ''}src="${esc(imageFor(p))}" alt="${esc(p.name)}" data-fallback="${esc(p.name)}">`;
}

// swap any broken image for the placeholder
function armFallbacks(root) {
    (root || document).querySelectorAll('img[data-fallback]').forEach(img => {
        const useFallback = () => {
            img.src = placeholder(img.dataset.fallback);
            img.removeAttribute('data-fallback');
        };
        img.addEventListener('error', useFallback, { once: true });
        if (img.complete && img.naturalWidth === 0) useFallback();
    });
}

function avatarColor(name) {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h} 55% 45%)`;
}

function toast(msg) {
    const t = $('#pp-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* =========================================================
   BACKEND PRODUCT -> the shape this page draws
   ========================================================= */
function toProduct(p) {
    const price = p.discountedPrice > 0 ? p.discountedPrice : p.price;
    const old = p.price > price ? p.price : undefined;          // crossed-out original price
    const ratings = p.ratings || [];
    const average = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    const feedback = buildFeedback(p.ratings, p.reviews);

    // every size becomes one option you can pick; no sizes = a single option
    const sizes = Array.from(p.sizes || []);
    const variants = sizes.length
        ? sizes.map(s => ({ label: `${p.title} - ${s.name}`, size: s.name, price, old, stock: s.quantity > 0 }))
        : [{ label: p.title, price, old, stock: p.quantity > 0 }];

    return {
        id: String(p.id),
        productId: p.id,                                         // the real backend id (needed for cart / reviews later)
        name: p.title,
        category: (p.category && p.category.name) || 'Other',
        rating: feedback.rating,
        reviewCount: feedback.reviewCount,
        img: p.imageUrl || undefined,
        description: p.description ? p.description.split(/\n+/) : [],
        variants,
        reviews: feedback.reviews,
    };
}

/* =========================================================
   PICK THE PRODUCT FROM THE URL
   ========================================================= */
// API_BASE is inherited from Api.js
let product = null;
const params = new URLSearchParams(location.search);
const wantedId = params.get('id') || Object.keys(PRODUCTS)[0];

// a product that has no entry anywhere still opens a page, with placeholder content
function makeFallback(name) {
    return {
        name,
        category: 'Other',
        rating: 0,
        reviewCount: 0,
        description: ['Full details for this product are coming soon.'],
        variants: [{ label: `${name} - Standard`, price: 10 }],   // placeholder price
        reviews: [],
    };
}

async function loadProduct() {
    // a number means a real product in the database
    if (/^\d+$/.test(wantedId)) {
        try {
            return toProduct(await apiFetch('/api/products/id/' + wantedId));
        } catch (err) {
            console.warn('Could not load product from the backend:', err.message);
            setTimeout(() => toast(err.message), 300);
        }
    }
    // otherwise (home-page sample cards, or the backend failed) use data.js
    const data = PRODUCTS[wantedId] || makeFallback(params.get('name') || titleCase(wantedId));
    return { id: wantedId, ...data };
}

// "You might also like": other products from the backend, or data.js if it is offline
async function loadRelated(product) {
    let others;
    try {
        const page = await apiFetch('/api/products?pageNumber=0&pageSize=12');
        others = page.content.map(toProduct);
    } catch {
        others = Object.entries(PRODUCTS).map(([key, val]) => ({ id: key, ...val }));
    }
    return others
        .filter(o => o.id !== product.id)
        .sort((a, b) => (b.category === product.category) - (a.category === product.category))
        .slice(0, 4);
}

(async function start() {
    const product = await loadProduct();
    initPage(product);
    renderRelated(product);
    if (Auth.isLoggedIn()) refreshFeedback(product);   // logged in: use the dedicated ratings/reviews endpoints
})();

/* =========================================================
   RENDER
   ========================================================= */
function initPage(product) {
    const state = {
        i: Math.max(0, product.variants.findIndex(v => v.stock !== false)),
        qty: 1,
    };

    document.title = `${product.name} | GiftCard`;

    /* ----- hero ----- */
    const cover = $('#pp-cover');
    cover.src = imageFor(product);
    cover.alt = product.name;
    cover.dataset.fallback = product.name;
    $('#pp-title').textContent = product.name;
    $('#pp-stars').style.setProperty('--rating', product.rating);
    $('#pp-rating-text').textContent = product.reviewCount
        ? `${product.rating.toFixed(1)} / 5 · ${product.reviewCount.toLocaleString('en-US')} ratings`
        : 'No ratings yet';

    const fav = $('#pp-fav');
    fav.addEventListener('click', () => {
        const on = fav.classList.toggle('on');
        fav.setAttribute('aria-pressed', on);
        fav.textContent = on ? '♥ Favorited' : '♡ Favorite';
    });

    /* ----- notice / description / instructions (each hidden if missing) ----- */
    if (product.notice) {
        $('#pp-notice-title').textContent = '⚠️ ' + product.notice.title;
        $('#pp-notice-text').textContent = product.notice.text;
        $('#pp-notice').hidden = false;
    }

    if (product.description && product.description.length) {
        $('#pp-desc').innerHTML = product.description.map(t => `<p>${esc(t)}</p>`).join('');
        $('#pp-desc-card').hidden = false;
        setupCollapse('#pp-desc', '#pp-desc-more');
    }

    if (product.instructions && product.instructions.length) {
        $('#pp-guide').innerHTML =
            `<ol class="pp-steps">${product.instructions.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`;
        $('#pp-guide-card').hidden = false;
        setupCollapse('#pp-guide', '#pp-guide-more');
    }

    /* ----- variants ----- */
    function renderVariants() {
        $('#pp-variants').innerHTML = product.variants.map((v, i) => {
            const out = v.stock === false;
            const disc = v.old && v.old > v.price ? Math.round((1 - v.price / v.old) * 100) : 0;
            return `
            <button type="button" class="pp-variant${i === state.i ? ' active' : ''}" data-i="${i}" ${out ? 'disabled' : ''}>
                ${imgTag(product)}
                <span class="pp-v-info">
                    <span class="pp-v-name">${esc(v.label)}</span>
                    <span class="pp-v-price">${money(v.price)}${v.old ? `<s>${money(v.old)}</s>` : ''}</span>
                    <span class="pp-v-meta">
                        ${out ? '<em class="out">Out of stock</em>' : '<em class="in">In stock</em>'}
                        ${disc ? `<b class="pp-disc">-${disc}%</b>` : ''}
                    </span>
                </span>
            </button>`;
        }).join('');
        armFallbacks($('#pp-variants'));
    }

    $('#pp-variants').addEventListener('click', e => {
        const btn = e.target.closest('.pp-variant');
        if (!btn || btn.disabled) return;
        state.i = Number(btn.dataset.i);
        renderVariants();
        updateTotals();
    });

    /* ----- buy box ----- */
    function updateTotals() {
        const v = product.variants[state.i];
        const original = (v.old || v.price) * state.qty;
        const total = v.price * state.qty;
        const out = v.stock === false;

        $('#pp-qty').textContent = state.qty;
        $('#pp-selected').textContent = `Selected: ${v.label}`;
        $('#pp-orig').textContent = money(original);
        $('#pp-save').textContent = money(original - total);
        $('#pp-total').textContent = money(total);
        $('#pp-add').disabled = out;
        $('#pp-buy').disabled = out;
    }

    $('#pp-minus').addEventListener('click', () => { state.qty = Math.max(1, state.qty - 1); updateTotals(); });
    $('#pp-plus').addEventListener('click',  () => { state.qty = Math.min(10, state.qty + 1); updateTotals(); });
    /* ----- add to cart (PUT /api/cart/add) ----- */
    async function addToCart(goToCart) {
        if (!product.productId) {                       // sample products from data.js are not in the database
            toast('Sample product: it is not in the store database yet');
            return;
        }
        if (!Auth.isLoggedIn()) {
            location.href = ROOT + 'auth.html?next=' + encodeURIComponent(location.href);
            return;
        }
        const v = product.variants[state.i];
        $('#pp-add').disabled = true;
        $('#pp-buy').disabled = true;
        try {
            await apiFetch('/api/cart/add', {
                method: 'PUT',
                body: { productId: product.productId, size: v.size || '', quantity: state.qty, price: v.price },
            });
            if (goToCart) { location.href = ROOT + 'cart.html'; return; }
            toast('Added to cart ✓');
        } catch (err) {
            toast(err.message);
        }
        updateTotals();                                  // puts the buttons back to normal
    }

    $('#pp-add').addEventListener('click', () => addToCart(false));
    $('#pp-buy').addEventListener('click', () => addToCart(true));      // Buy now = add, then open the cart

    renderReviews(product);

    renderVariants();
    updateTotals();
    armFallbacks();
}

/* ----- recommended (sidebar, below reviews) ----- */
async function renderRelated(product) {
    const others = await loadRelated(product);

    if (others.length) {
        $('#pp-rel-list').innerHTML = others.map(o => {
            const from = Math.min(...o.variants.map(v => v.price));
            return `
            <a href="products.html?id=${encodeURIComponent(o.id)}&name=${encodeURIComponent(o.name)}" class="pp-rel">
                ${imgTag(o)}
                <div class="pp-rel-info">
                    <h4>${esc(o.name)}</h4>
                    <span class="pp-rel-price">From ${money(from)}</span>
                    <div class="stars" style="--rating: ${o.rating}">★★★★★</div>
                </div>
            </a>`;
        }).join('');
        armFallbacks($('#pp-rel-list'));
    } else {
        $('#pp-related').hidden = true;
    }
}

/* "See more" toggle - only shown when the text is actually taller than the box */
function setupCollapse(boxSel, btnSel) {
    const box = $(boxSel), btn = $(btnSel);
    if (box.scrollHeight <= 175) {
        box.classList.add('open');
        btn.hidden = true;
        return;
    }
    btn.addEventListener('click', () => {
        const open = box.classList.toggle('open');
        btn.textContent = open ? 'Show less ▲' : 'See more ▼';
    });
}


/* =========================================================
   RATINGS + REVIEWS
   GET  /api/reviews/product/{id}    GET  /api/ratings/product/{id}
   POST /api/ratings/create          POST /api/reviews/create
   ========================================================= */
// the backend may send dates as "2026-10-24T10:15:30" or as [2026,10,24,10,15,30]
const dateOf = v => v ? (Array.isArray(v) ? new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0) : new Date(v)) : new Date(0);

// ratings (stars) and reviews (text) are separate lists in the backend.
// A review shows stars when the same user also left a rating.
function buildFeedback(ratings, reviews) {
    ratings = ratings || [];
    reviews = reviews || [];
    const byUser = {};
    ratings.forEach(r => { if (r.user) byUser[r.user.id] = r.rating; });

    return {
        rating: ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0,
        reviewCount: ratings.length,
        reviews: [...reviews].sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt)).map(r => {
            const u = r.user || {};
            const d = dateOf(r.createdAt);
            return {
                user: ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || 'Customer',
                date: isNaN(d) || d.getTime() === 0 ? '' : d.toLocaleDateString('en-US', { dateStyle: 'medium' }),
                rating: u.id != null ? byUser[u.id] : undefined,
                text: r.review || '',
            };
        }),
    };
}

function renderReviews(product) {
    // hero stars + text
    $('#pp-stars').style.setProperty('--rating', product.rating);
    $('#pp-rating-text').textContent = product.reviewCount
        ? `${product.rating.toFixed(1)} / 5 · ${product.reviewCount.toLocaleString('en-US')} ratings`
        : 'No ratings yet';

    $('#pp-rev-sum').innerHTML = `
        <strong>${product.rating.toFixed(1)}</strong>
        <div>
            <div class="stars" style="--rating: ${product.rating}">★★★★★</div>
            <span>${product.reviewCount.toLocaleString('en-US')} ratings</span>
        </div>`;

    const reviews = product.reviews || [];
    $('#pp-rev-list').innerHTML = reviews.length ? reviews.map(r => `
        <div class="pp-review">
            <div class="pp-avatar" style="background:${avatarColor(r.user)}">${esc(r.user[0].toUpperCase())}</div>
            <div class="pp-rev-body">
                <div class="pp-rev-top">
                    <b>${esc(r.user)}</b>
                    ${r.rating != null ? `<div class="stars" style="--rating: ${r.rating}">★★★★★</div>` : ''}
                </div>
                <div class="pp-rev-date">${esc(r.date)}</div>
                <p>${esc(r.text)}</p>
            </div>
        </div>`).join('') : '<p>No reviews yet.</p>';

    renderReviewForm(product);
}

// reload both lists (needs a login on some backends, so fall back to the lists inside the product)
async function refreshFeedback(product) {
    if (!product.productId) return;
    try {
        let ratings, reviews;
        try {
            [reviews, ratings] = await Promise.all([
                apiFetch('/api/reviews/product/' + product.productId),
                apiFetch('/api/ratings/product/' + product.productId),
            ]);
        } catch {
            const fresh = await apiFetch('/api/products/id/' + product.productId);
            ratings = fresh.ratings;
            reviews = fresh.reviews;
        }
        Object.assign(product, buildFeedback(ratings, reviews));
        renderReviews(product);
    } catch (err) {
        console.warn('Could not refresh reviews:', err.message);
    }
}

// the star picker + review box, or a "log in" note
function renderReviewForm(product) {
    let box = $('#pp-rev-form');
    if (!box) {
        box = document.createElement('div');
        box.id = 'pp-rev-form';
        $('#pp-rev-list').before(box);

        const style = document.createElement('style');       // styles for the form, kept here so products.css stays untouched
        style.textContent = `
            .rf{ margin-bottom:18px; }
            .rf-stars{ display:flex; gap:4px; margin-bottom:10px; }
            .rf-stars button{ border:none; background:none; padding:0 2px; color:#4a4670; font-size:26px; cursor:pointer; transition:color .15s, transform .15s; }
            .rf-stars button:hover{ transform:scale(1.15); }
            .rf-stars button.on{ color:#ffc107; }
            .rf textarea{ width:100%; padding:12px 16px; border:1px solid rgba(255,255,255,.18); border-radius:16px; background:rgba(255,255,255,.05); color:#fff; font-family:inherit; font-size:14px; outline:none; resize:vertical; }
            .rf textarea:focus{ border-color:#3b6cff; }
            .rf-msg{ min-height:18px; margin:6px 4px; color:#ff7a6b; font-size:13px; }
            .rf-btn{ padding:10px 26px; border:none; border-radius:30px; background:#ff523b; color:#fff; font-family:inherit; font-size:14px; cursor:pointer; }
            .rf-btn:disabled{ opacity:.5; cursor:wait; }
            .rf-note{ margin-bottom:18px; font-size:14px; }
            .rf-note a{ color:#6f93ff; }`;
        document.head.appendChild(style);
    }

    if (!product.productId) { box.innerHTML = ''; return; }          // sample product, not in the database

    if (!Auth.isLoggedIn()) {
        box.innerHTML = `<p class="rf-note"><a href="${ROOT}auth.html?next=${encodeURIComponent(location.href)}">Log in</a> to rate and review this product.</p>`;
        return;
    }

    box.innerHTML = `
        <form class="rf" novalidate>
            <div class="rf-stars" role="group" aria-label="Your rating">
                ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-v="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}
            </div>
            <textarea name="review" rows="3" placeholder="Write a review (optional)"></textarea>
            <p class="rf-msg" role="alert"></p>
            <button type="submit" class="rf-btn">Submit</button>
        </form>`;

    const formEl = box.querySelector('form');
    const stars = formEl.querySelectorAll('.rf-stars button');
    let picked = 0;

    stars.forEach(b => b.addEventListener('click', () => {
        picked = Number(b.dataset.v);
        stars.forEach(s => s.classList.toggle('on', Number(s.dataset.v) <= picked));
    }));

    formEl.addEventListener('submit', async e => {
        e.preventDefault();
        const msg = formEl.querySelector('.rf-msg');
        const btn = formEl.querySelector('.rf-btn');
        const text = formEl.review.value.trim();
        msg.textContent = '';

        if (!picked && !text) { msg.textContent = 'Pick a star rating or write a review.'; return; }

        btn.disabled = true;
        try {
            if (picked) await apiFetch('/api/ratings/create', { method: 'POST', body: { productId: product.productId, rating: picked } });
            if (text)   await apiFetch('/api/reviews/create', { method: 'POST', body: { productId: product.productId, review: text } });
            await refreshFeedback(product);
            toast('Thanks for your feedback ✓');
        } catch (err) {
            msg.textContent = err.message;
            btn.disabled = false;
        }
    });
}