/* =========================================================
   products.js - builds the product page.
   The product DATA now lives in ../data.js (loaded first by
   products.html), so there is nothing to edit here to change
   a name, price or description.
   ========================================================= */

/* =========================================================
   HELPERS
   ========================================================= */
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
const imageFor = p => {
    const src = p.img || `${p.id}.png`;
    return /^(https?:|data:|\/|\.\.\/)/.test(src) ? src : IMG_DIR + src;
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
   PICK THE PRODUCT FROM THE URL
   products.html?id=netflix            -> full data from data.js
   products.html?id=xyz&name=Some Card -> stand-in page (no data yet)
   ========================================================= */
const params = new URLSearchParams(location.search);
const wantedId = params.get('id') || Object.keys(PRODUCTS)[0];

// a product that has no entry in data.js yet still opens a page, with placeholder content
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

const data = PRODUCTS[wantedId] || makeFallback(params.get('name') || titleCase(wantedId));
const product = { id: wantedId, ...data };

initPage();

/* =========================================================
   RENDER
   ========================================================= */
function initPage() {
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
        ? `${product.rating.toFixed(1)} / 5 · ${product.reviewCount.toLocaleString('en-US')} reviews`
        : 'No reviews yet';

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
                        ${out ? '<em class="out">Out of stock</em>' : '<em class="in">Instant delivery</em>'}
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
    $('#pp-add').addEventListener('click', () => toast('Added to cart ✓'));
    $('#pp-buy').addEventListener('click', () => toast('Checkout is not connected yet'));

    /* ----- reviews (sidebar, first) ----- */
    $('#pp-rev-sum').innerHTML = `
        <strong>${product.rating.toFixed(1)}</strong>
        <div>
            <div class="stars" style="--rating: ${product.rating}">★★★★★</div>
            <span>${product.reviewCount.toLocaleString('en-US')} reviews</span>
        </div>`;

    const reviews = product.reviews || [];
    if (reviews.length) {
        $('#pp-rev-list').innerHTML = reviews.map(r => `
            <div class="pp-review">
                <div class="pp-avatar" style="background:${avatarColor(r.user)}">${esc(r.user[0].toUpperCase())}</div>
                <div class="pp-rev-body">
                    <div class="pp-rev-top">
                        <b>${esc(r.user)}</b>
                        <div class="stars" style="--rating: ${r.rating}">★★★★★</div>
                    </div>
                    <div class="pp-rev-date">${esc(r.date)}</div>
                    <p>${esc(r.text)}</p>
                </div>
            </div>`).join('');
    } else {
        $('#pp-rev-list').innerHTML = '<p>No reviews yet.</p>';
    }

    /* ----- recommended (sidebar, below reviews) ----- */
    const others = Object.entries(PRODUCTS)
        .filter(([key]) => key !== product.id)
        .map(([key, val]) => ({ id: key, ...val }))
        .sort((a, b) => (b.category === product.category) - (a.category === product.category))
        .slice(0, 4);

    if (others.length) {
        $('#pp-rel-list').innerHTML = others.map(o => {
            const from = Math.min(...o.variants.map(v => v.price));
            return `
            <a href="products.html?id=${encodeURIComponent(o.id)}" class="pp-rel">
                ${imgTag(o)}
                <div class="pp-rel-info">
                    <h4>${esc(o.name)}</h4>
                    <span class="pp-rel-price">From ${money(from)}</span>
                    <div class="stars" style="--rating: ${o.rating}">★★★★★</div>
                </div>
            </a>`;
        }).join('');
    } else {
        $('#pp-related').hidden = true;
    }

    renderVariants();
    updateTotals();
    armFallbacks();
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