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
    const chosenImage = item.img || resolveProductImage(item.name);
    q.set('img', chosenImage);
    ['price', 'rating'].forEach(k => {
        if (item[k] != null && item[k] !== '') q.set(k, item[k]);
    });
    return 'products/products.html?' + q.toString();
}

/* ---------- product cards ---------- */
// API_BASE is inherited from Api.js
const productGrid = document.querySelector('.product-grid');

const fallbackProducts = [
    { name: "VND Steam Wallet Việt Nam Gift Card", price: 420, rating: 4.5, img: "product_images/testing.png" },
    { name: "USD Steam Wallet Card Order",         price: 67,  rating: 4.5, img: "product_images/testing.png" },
    { name: "Euro Steam Wallet Gift Card",         price: 99,  rating: 1.0, img: "product_images/testing.png" },
    { name: "PUBG PC Pass Steam",                  price: 30,  rating: 4.5, img: "product_images/testing.png" },
    { name: "Random Steam Game Code",              price: 9,   rating: 2.0, img: "product_images/testing.png" },
    { name: "Where Winds Meet Top-up",             price: 25,  rating: 4.5, img: "product_images/testing.png" },
    { name: "Game Top-up Card",                    price: 67,  rating: 3.35, img: "product_images/testing.png" },
    { name: "Game Top-up Card",                    price: 67,  rating: 3.35, img: "product_images/testing.png" },
    { name: "Game Top-up Card",                    price: 67,  rating: 3.35, img: "product_images/testing.png" },
    { name: "Game Top-up Card",                    price: 67,  rating: 3.35, img: "product_images/testing.png" }
];
const USD_RATE = 24000;

function toUsd(value) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric / USD_RATE : 0;
}

function formatUsd(value, digits = 2) {
    return `$${Number(value ?? 0).toFixed(digits)}`;
}

function productAsset(fileName) {
    return `product_images/${fileName}`;
}

let products = [...fallbackProducts].map((item, idx) => ({
    ...item,
    id: String(idx + 1),
    priceValue: Number(item.price ?? 0),
    price: formatUsd(Number(item.price ?? 0)),
    img: item.img || "product_images/testing.png"
}));

function resolveProductImage(productName) {
    const text = String(productName || '').toLowerCase();
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
    const fileName = match ? match.file : 'testing.png';
    return productAsset(fileName);
}

function resolveVoucherImage(panelTitle) {
    const key = String(panelTitle || '').toLowerCase();
    if (key.includes('battle')) return productAsset('BattlePass.jpg');
    if (key.includes('rare')) return productAsset('RareDrops.webp');
    if (key.includes('skin') || key.includes('weapon')) return productAsset('Skin &Weapons.webp');
    return productAsset('Skin &Weapons.webp');
}

function resolveServiceImage(groupTitle) {
    const key = String(groupTitle || '').toLowerCase();
    if (key.includes('rank')) return productAsset('RankBoost.webp');
    if (key.includes('farm')) return productAsset('Farming.webp');
    if (key.includes('quest') || key.includes('mission')) return productAsset('Quest&Mission.webp');
    if (key.includes('level') || key.includes('carry')) return productAsset('LevelUp.jpg');
    return productAsset('RankBoost.webp');
}

function mapApiProduct(product) {
    const normalizedPrice = Number(product.discountedPrice ?? product.price ?? 0);
    const priceUsd = toUsd(normalizedPrice);
    const productName = product.title || product.name || 'Gift Card';
    const chosenImage = resolveProductImage(productName);

    return {
        id: String(product.id ?? product.title ?? Math.random().toString(16).slice(2)),
        name: productName,
        priceValue: priceUsd > 0 ? priceUsd : 10,
        price: formatUsd(priceUsd > 0 ? priceUsd : 10),
        rating: Number(product.numRatings ?? product.rating ?? 4.5),
        img: chosenImage
    };
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const money = n => typeof n === 'number' ? `$${n.toFixed(2)}` : String(n ?? '');

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

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function buildLimitedOffers() {
    const dealGrid = document.querySelector('.deal-grid');
    if (!dealGrid) return;

    const featured = [...products].filter(p => Number(p.priceValue ?? p.price ?? 0) > 0);
    const picks = shuffle(featured).slice(0, 3);

    dealGrid.innerHTML = picks.map((item, idx) => {
        const base = Number(item.priceValue ?? item.price ?? 10);
        const discount = 20 + (idx * 10) + (Math.random() > 0.5 ? 5 : 0);
        const finalPrice = base * (1 - discount / 100);
        const oldPrice = base;
        return `
            <a href="${productUrl(item)}" class="deal-card">
                <span class="deal-badge">-${discount}%</span>
                <img src="${item.img}" alt="${item.name}">
                <div class="deal-info">
                    <h4>${item.name}</h4>
                    <p><span class="old">${formatUsd(oldPrice)}</span> <span class="new">${formatUsd(finalPrice)}</span></p>
                </div>
            </a>
        `;
    }).join('');
}

const voucherItems = [
    { name: 'AK-47 Redline skin', category: 'Skin', oldPrice: 18.99, price: 12.99 },
    { name: 'M416 Glacier skin', category: 'Skin', oldPrice: 16.5, price: 11.25 },
    { name: 'AWM Dragon skin', category: 'Weapon', oldPrice: 21.0, price: 14.0 },
    { name: 'Glock Phantom skin', category: 'Weapon', oldPrice: 15.0, price: 10.25 },
    { name: 'M4A1-S Ghost skin', category: 'Skin', oldPrice: 14.99, price: 9.99 },
    { name: 'Valorant Prime bundle', category: 'Bundle', oldPrice: 19.0, price: 12.5 },
    { name: 'PUBG UMP skin pack', category: 'Skin', oldPrice: 17.5, price: 11.5 },
    { name: 'Free Fire AK47 skin', category: 'Skin', oldPrice: 13.25, price: 8.99 },
    { name: 'Genshin weapon upgrade pass', category: 'Weapon', oldPrice: 24.0, price: 16.0 },
    { name: 'Minecraft rare bundle', category: 'Bundle', oldPrice: 12.5, price: 8.75 },
    { name: 'CS2 knife skin', category: 'Weapon', oldPrice: 29.0, price: 19.0 },
    { name: 'League skin discount pack', category: 'Skin', oldPrice: 20.0, price: 13.5 }
];

const serviceItems = [
    { name: 'Rank boost (Gold to Diamond)', type: 'Rank boost', oldPrice: 24.0, price: 16.99 },
    { name: 'Valorant win boost', type: 'Rank boost', oldPrice: 19.0, price: 13.5 },
    { name: 'PUBG squad placement', type: 'Mission', oldPrice: 14.0, price: 9.5 },
    { name: 'Genshin artifact farming', type: 'Farming', oldPrice: 18.0, price: 12.25 },
    { name: 'LOL ranked carry', type: 'Rank boost', oldPrice: 26.0, price: 17.5 },
    { name: 'Map clearing service', type: 'Quest', oldPrice: 16.0, price: 11.0 },
    { name: 'Daily mission completion', type: 'Mission', oldPrice: 12.0, price: 8.0 },
    { name: 'Dungeon clear boost', type: 'Quest', oldPrice: 15.5, price: 10.49 },
    { name: 'Arena win boost', type: 'Rank boost', oldPrice: 21.0, price: 14.25 },
    { name: 'Weapon upgrade setup', type: 'Service', oldPrice: 11.0, price: 7.25 },
    { name: 'Character leveling service', type: 'Leveling', oldPrice: 22.0, price: 15.0 },
    { name: 'Story mode completion', type: 'Mission', oldPrice: 13.25, price: 9.0 },
    { name: 'Boss farming support', type: 'Farming', oldPrice: 17.5, price: 11.75 },
    { name: 'Raid carry service', type: 'Quest', oldPrice: 28.5, price: 19.5 }
];

function renderVoucherGrid() {
    const container = document.querySelector('.voucher-grid');
    if (!container) return;

    const panelTitles = ['Skin & Weapon', 'Battle Pass', 'Rare Drops'];
    const grouped = [
        voucherItems.slice(0, 4),
        voucherItems.slice(4, 8),
        voucherItems.slice(8, 12)
    ];

    container.innerHTML = grouped.map((group, groupIndex) => {
        const title = panelTitles[groupIndex];
        const image = resolveVoucherImage(title);

        return `
            <div class="voucher-panel">
                <div class="panel-head">
                    <h3>${title}</h3>
                    <a href="" class="view-more">View more</a>
                </div>
                ${group.map(item => `
                    <div class="voucher-item" data-name="${item.name}">
                        <img src="${image}" alt="${item.name}">
                        <div class="info">
                            <h4>${item.name}</h4>
                            <p class="price">${formatUsd(item.price)} - ${formatUsd(item.oldPrice)}</p>
                            <p class="stars">★★★★★</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function renderServices() {
    const track = document.querySelector('.services-track');
    if (!track) return;

    const groups = [
        { title: 'Rank Boost', items: serviceItems.filter(s => s.type === 'Rank boost').slice(0, 4) },
        { title: 'Farming', items: serviceItems.filter(s => s.type === 'Farming').slice(0, 4) },
        { title: 'Mission & Quest', items: serviceItems.filter(s => s.type === 'Mission' || s.type === 'Quest').slice(0, 4) },
        { title: 'Leveling & Carry', items: serviceItems.filter(s => s.type === 'Leveling' || s.type === 'Service').slice(0, 4) }
    ];

    track.innerHTML = groups.map(g => {
        const image = resolveServiceImage(g.title);
        return `
            <div class="svc-panel">
                <div class="svc-panel-head">
                    <h3>${g.title}</h3>
                    <a href="" class="svc-more">View more</a>
                </div>
                ${g.items.map(i => `
                    <a href="${productUrl({ id: slug(i.name), name: i.name, img: image, price: formatUsd(i.price) })}" class="svc-row">
                        <img src="${image}" alt="${i.name}">
                        <div class="svc-info">
                            <h4>${i.name}</h4>
                            <p class="svc-price">${formatUsd(i.price)}</p>
                            <div class="stars" style="--rating: 4.5">★★★★★</div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }).join('');
}

function refreshStorefrontSections() {
    buildLimitedOffers();
    renderVoucherGrid();
    renderServices();
}

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

/* ---------- filters + search ---------- */
const filters = {
    suggested: list => list,
    under:     list => list.filter(p => (p.priceValue ?? parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))) < 50),
    above:     list => list.filter(p => (p.priceValue ?? parseFloat(String(p.price).replace(/[^0-9.-]+/g, ''))) >= 50),
    top:       list => [...list].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)),
    low:       list => [...list].sort((a, b) => (a.priceValue ?? parseFloat(String(a.price).replace(/[^0-9.-]+/g, ''))) - (b.priceValue ?? parseFloat(String(b.price).replace(/[^0-9.-]+/g, '')))),
};

let activeFilter = 'suggested';
let searchText = '';

function applyFilters() {
    const searched = products.filter(p => p.name.toLowerCase().includes(searchText));
    const result = filters[activeFilter](searched);

    if (!productGrid) {
        return;
    }

    if (result.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No cards found 😕</p>';
    } else {
        renderProducts(result);
    }
}

document.getElementById('sort-select').addEventListener('change', e => {
    activeFilter = e.target.value;
    applyFilters();
});

const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('input', e => {
        searchText = e.target.value.toLowerCase();
        applyFilters();
    });
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/products?pageNumber=0&pageSize=20`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`API responded with ${response.status}`);
        }

        const payload = await response.json();
        const items = Array.isArray(payload) ? payload : (payload.content || []);

        if (Array.isArray(items) && items.length > 0) {
            products = items.map(mapApiProduct);
            applyFilters();
            refreshStorefrontSections();
            return;
        }
    } catch (error) {
        console.warn('Falling back to local sample products:', error);
    }

    products = [...fallbackProducts].map((item, idx) => ({
        ...item,
        id: String(idx + 1),
        priceValue: Number(item.price ?? 0),
        price: formatUsd(Number(item.price ?? 0)),
        img: resolveProductImage(item.name)
    }));
    applyFilters();
    refreshStorefrontSections();
}

applyFilters();
loadProducts();

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