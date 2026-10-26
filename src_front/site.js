const slider = document.querySelector('.slider');
const track  = document.querySelector('.slide-track');
const dotsBox = document.querySelector('.dots');
const total  = track.children.length;          // real images only

// build one dot per image
for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.addEventListener('click', () => {
        goTo(i);
        restartAuto();
    });
    dotsBox.appendChild(dot);
}
const dots = document.querySelectorAll('.dot');

// clone the first image onto the end so the loop is seamless
track.appendChild(track.children[0].cloneNode(true));

let index = 0;
let timer;

function updateDots() {
    dots.forEach(d => d.classList.remove('active'));
    dots[index % total].classList.add('active');   // clone counts as slide 0
}

function goTo(i) {
    track.style.transition = 'transform 2.0s ease';
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
}

function next() {
    if (index < total) goTo(index + 1);
}

function prev() {
    if (index === 0) {
        // jump instantly to the clone at the end, then slide back one
        track.style.transition = 'none';
        index = total;
        track.style.transform = `translateX(-${index * 100}%)`;
        track.offsetWidth;                         // force the browser to apply the jump
    }
    goTo(index - 1);
}

// after sliding onto the clone, silently snap back to the real first image
track.addEventListener('transitionend', (e) => {
    if (e.target === track && index === total) {
        track.style.transition = 'none';
        index = 0;
        track.style.transform = 'translateX(0)';
        updateDots();
    }
});

function startAuto()   { timer = setInterval(next, 10000); }
function stopAuto()    { clearInterval(timer); }
function restartAuto() { stopAuto(); startAuto(); }

document.querySelector('.next').addEventListener('click', () => { next(); restartAuto(); });
document.querySelector('.prev').addEventListener('click', () => { prev(); restartAuto(); });

slider.addEventListener('mouseenter', stopAuto);
slider.addEventListener('mouseleave', startAuto);

updateDots();
startAuto();

/* ---------- links to the product page ---------- */
// "Disney+ Gift Card" -> "disney-gift-card"
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// the clicked card's own info travels in the URL, so the product page can show it
function productUrl(item) {
    const q = new URLSearchParams({ id: item.id || slug(item.name), name: item.name });
    ['price', 'rating', 'img'].forEach(k => {
        if (item[k] != null && item[k] !== '') q.set(k, item[k]);
    });
    return 'products/products.html?' + q.toString();
}

/* =========================================================
   PRODUCT CARDS - loaded from the backend (GET /api/products)
   ========================================================= */

// Under / Above filter splits at this price
const PRICE_SPLIT = 50;

// While the backend is not running, show a few sample cards so the page still looks alive.
// Set to false when the backend works, or delete SAMPLE_PRODUCTS completely.
const SHOW_SAMPLE_WHEN_OFFLINE = true;

const SAMPLE_PRODUCTS = [
    { id: "netflix", name: "Netflix Gift Card",    price: 15,  rating: 4.5, img: "product_images/testing.png" },
    { id: "spotify", name: "Spotify Premium Card", price: 10,  rating: 4.5, img: "product_images/testing.png" },
    { id: "amazon",  name: "Amazon Gift Card",     price: 49,  rating: 5,   img: "product_images/testing.png" },
    { id: "steam-usd", name: "Steam Wallet Card - USD", price: 67, rating: 3.5, img: "product_images/testing.png" },
];

const productGrid = document.querySelector('.product-grid');

const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// product names come from the database, so escape them before putting them in HTML
const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// the backend has no "average rating" field, so we work it out from the list of ratings
function averageRating(p) {
    const list = p.ratings || [];
    if (!list.length) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
}

// translate a backend product (title, discountedPrice, imageUrl...) into what our cards use
// imageUrl from the backend is either a full https:// link, or just a file name inside product_images/
const imageFromBackend = url => {
    if (!url) return 'product_images/testing.png';
    if (/^(https?:|data:|\/)/.test(url)) return url;
    return url.startsWith('product_images/') ? url : 'product_images/' + url;
};

function fromBackend(p) {
    return {
        id: p.id,
        name: p.title,
        price: p.discountedPrice > 0 ? p.discountedPrice : p.price,
        rating: averageRating(p),
        img: imageFromBackend(p.imageUrl),
    };
}

let allProducts = [];
let usingSample = false;
let activeFilter = 'suggested';
let searchText = '';

// small message line above the grid (errors, "sample data" notice)
const notice = document.createElement('p');
notice.style.cssText = 'text-align:center; margin-bottom:16px; font-size:14px;';
productGrid.before(notice);

function renderProducts(list) {
    productGrid.innerHTML = list.map(p => `
        <a href="${esc(productUrl(p))}" class="product-card">
            <img src="${esc(p.img)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='product_images/testing.png'">
            <div class="product-info">
                <h4>${esc(p.name)}</h4>
                <p class="price">${money(p.price)}</p>
                <div class="stars" style="--rating: ${p.rating}">★★★★★</div>
            </div>
        </a>
    `).join('');
}

// the sort menu decides what we ask the backend for
function buildQuery() {
    const q = new URLSearchParams({ pageNumber: 0, pageSize: 100 });
    if (activeFilter === 'under') q.set('maxPrice', PRICE_SPLIT - 1);
    if (activeFilter === 'above') q.set('minPrice', PRICE_SPLIT);
    if (activeFilter === 'low')   q.set('sort', 'price_low');
    return q.toString();
}

async function loadProducts() {
    productGrid.innerHTML = '<p class="no-results">Loading...</p>';
    notice.textContent = '';
    usingSample = false;

    try {
        const page = await apiFetch('/api/products?' + buildQuery());
        allProducts = page.content.map(fromBackend);       // Spring wraps the list in "content"
    } catch (err) {
        console.warn('Could not load products:', err.message);
        if (SHOW_SAMPLE_WHEN_OFFLINE) {
            usingSample = true;
            allProducts = SAMPLE_PRODUCTS;
            notice.style.color = '#ffc107';
            notice.textContent = 'Showing sample products: ' + err.message;
        } else {
            allProducts = [];
            notice.style.color = '#ff7a6b';
            notice.textContent = err.message;
        }
    }
    showProducts();
}

// search and "Top rated" are done here, because the backend has no endpoint for them
function showProducts() {
    let list = allProducts.filter(p => p.name.toLowerCase().includes(searchText));

    if (usingSample) {   // sample data did not go through the backend, so filter it here
        if (activeFilter === 'under') list = list.filter(p => p.price < PRICE_SPLIT);
        if (activeFilter === 'above') list = list.filter(p => p.price >= PRICE_SPLIT);
        if (activeFilter === 'low')   list = [...list].sort((a, b) => a.price - b.price);
    }
    if (activeFilter === 'top') {
        list = list.filter(p => p.rating >= 4).sort((a, b) => b.rating - a.rating);
    }

    if (list.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No cards found 😕</p>';
    } else {
        renderProducts(list);
    }
}

document.getElementById('sort-select').addEventListener('change', e => {
    activeFilter = e.target.value;
    loadProducts();
});

// the navbar search box filters the list as you type
document.querySelector('.search-box input').addEventListener('input', e => {
    searchText = e.target.value.toLowerCase();
    showProducts();
});

loadProducts();

/* ---------- deal countdown ---------- */
function endOfWeek() {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);   // next Sunday night
    return d;
}

function tickCountdown() {
    const diff = Math.max(0, endOfWeek() - new Date());
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cd-days').textContent  = pad(Math.floor(diff / 86400000));
    document.getElementById('cd-hours').textContent = pad(Math.floor(diff / 3600000) % 24);
    document.getElementById('cd-mins').textContent  = pad(Math.floor(diff / 60000) % 60);
    document.getElementById('cd-secs').textContent  = pad(Math.floor(diff / 1000) % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- deal-of-the-week + voucher cards -> product page ---------- */
document.querySelectorAll('.deal-card, .voucher-item').forEach(card => {
    const text = sel => { const el = card.querySelector(sel); return el ? el.textContent.trim() : ''; };
    const img = card.querySelector('img');
    const target = productUrl({
        name:  text('h4'),
        price: text('.new') || text('.price'),
        img:   img ? img.getAttribute('src') : '',
    });
    if (card.tagName === 'A') {
        card.href = target;
    } else {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => { location.href = target; });
    }
});

(function () {
    const groups = [
        { title: "Streaming", items: [
            { id: "netflix", name: "Netflix Gift Card",     price: "$15 ~ $100", rating: 4.5, img: "product_images/testing.png" },
            { id: "spotify", name: "Spotify Premium Card",  price: "$10 ~ $60",  rating: 4.5, img: "product_images/testing.png" },
            { name: "Disney+ Gift Card",     price: "$25 ~ $100", rating: 4,   img: "product_images/testing.png" },
        ]},
        { title: "Shopping", items: [
            { id: "amazon", name: "Amazon Gift Card",      price: "$10 ~ $500", rating: 5,   img: "product_images/testing.png" },
            { name: "Google Play Gift Card", price: "$5 ~ $100",  rating: 4.5, img: "product_images/testing.png" },
            { name: "Apple Gift Card",       price: "$10 ~ $200", rating: 4.5, img: "product_images/testing.png" },
        ]},
        { title: "Chat & Social", items: [
            { name: "Discord Nitro",         price: "$10 ~ $100", rating: 4.5, img: "product_images/testing.png" },
            { name: "Telegram Premium",      price: "$5 ~ $50",   rating: 4,   img: "product_images/testing.png" },
            { name: "Twitch Gift Card",      price: "$10 ~ $100", rating: 4,   img: "product_images/testing.png" },
        ]},
        { title: "Software", items: [
            { name: "Microsoft 365",         price: "$20 ~ $100", rating: 4.5, img: "product_images/testing.png" },
            { name: "Adobe Creative Cloud",  price: "$30 ~ $300", rating: 4,   img: "product_images/testing.png" },
            { name: "NordVPN Subscription",  price: "$15 ~ $120", rating: 4.5, img: "product_images/testing.png" },
        ]},
    ];

    const svcTrack = document.querySelector('.services-track');

    svcTrack.innerHTML = groups.map(g => `
        <div class="svc-panel">
            <div class="svc-panel-head">
                <h3>${g.title}</h3>
                <a href="" class="svc-more">View more</a>
            </div>
            ${g.items.map(i => `
                <a href="${productUrl(i)}" class="svc-row">
                    <img src="${i.img}" alt="${i.name}">
                    <div class="svc-info">
                        <h4>${i.name}</h4>
                        <p class="svc-price">${i.price}</p>
                        <div class="stars" style="--rating: ${i.rating}">★★★★★</div>
                    </div>
                </a>`).join('')}
        </div>`).join('');

    // slide one "page" (the visible width) at a time, looping at the ends
    function slide(dir) {
        const atEnd   = svcTrack.scrollLeft + svcTrack.clientWidth >= svcTrack.scrollWidth - 5;
        const atStart = svcTrack.scrollLeft <= 5;
        if (dir > 0 && atEnd)   return svcTrack.scrollTo({ left: 0, behavior: 'smooth' });
        if (dir < 0 && atStart) return svcTrack.scrollTo({ left: svcTrack.scrollWidth, behavior: 'smooth' });
        svcTrack.scrollBy({ left: dir * svcTrack.clientWidth, behavior: 'smooth' });
    }

    let svcTimer;
    const start = () => { stop(); svcTimer = setInterval(() => slide(1), 6000); };
    const stop  = () => clearInterval(svcTimer);

    document.querySelector('.svc-next').addEventListener('click', () => { slide(1);  start(); });
    document.querySelector('.svc-prev').addEventListener('click', () => { slide(-1); start(); });

    const wrap = document.querySelector('.services-wrap');
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);

    start();
})();