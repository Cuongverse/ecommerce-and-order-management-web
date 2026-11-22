/* =========================================================
   Homepage interactions and live product catalog.
   Product cards are loaded from GET /api/products.
   ========================================================= */

/* ---------- hero slider ---------- */
const slider = document.querySelector('.slider');
const track = document.querySelector('.slide-track');
const dotsBox = document.querySelector('.dots');
const total = track ? track.children.length : 0;

if (slider && track && dotsBox && total > 0) {
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); restartAuto(); });
        dotsBox.appendChild(dot);
    }
    const dots = dotsBox.querySelectorAll('.dot');
    track.appendChild(track.children[0].cloneNode(true));

    let index = 0;
    let timer;

    function updateDots() {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index % total]) dots[index % total].classList.add('active');
    }
    function goTo(nextIndex) {
        track.style.transition = 'transform 2.0s ease';
        index = nextIndex;
        track.style.transform = `translateX(-${index * 100}%)`;
        updateDots();
    }
    function next() {
        if (index < total) goTo(index + 1);
    }
    function prev() {
        if (index === 0) {
            track.style.transition = 'none';
            index = total;
            track.style.transform = `translateX(-${index * 100}%)`;
            track.offsetWidth;
        }
        goTo(index - 1);
    }
    track.addEventListener('transitionend', event => {
        if (event.target === track && index === total) {
            track.style.transition = 'none';
            index = 0;
            track.style.transform = 'translateX(0)';
            updateDots();
        }
    });
    function startAuto() { stopAuto(); timer = setInterval(next, 10000); }
    function stopAuto() { clearInterval(timer); }
    function restartAuto() { startAuto(); }

    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    if (nextButton) nextButton.addEventListener('click', () => { next(); restartAuto(); });
    if (prevButton) prevButton.addEventListener('click', () => { prev(); restartAuto(); });
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    updateDots();
    startAuto();
}

/* ---------- product page links ---------- */
const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function productUrl(item) {
    const id = String(item.id || slug(item.name));
    const isBackendProduct = /^\d+$/.test(id);
    const isKnownDemoProduct = typeof PRODUCTS !== 'undefined' &&
        Object.prototype.hasOwnProperty.call(PRODUCTS, id);

    // Do not route promotional placeholders to a made-up $10 product page.
    // Unknown static names lead to the actual backend-powered catalog instead.
    if (!isBackendProduct && !isKnownDemoProduct) return 'site.html#featured';

    const query = new URLSearchParams({ id, name: item.name || 'Product' });
    ['price', 'rating', 'img'].forEach(key => {
        if (item[key] != null && item[key] !== '') query.set(key, item[key]);
    });
    return 'products/products.html?' + query.toString();
}

/* =========================================================
   PRODUCT CARDS - live backend data only.
   ========================================================= */
const PRICE_SPLIT = 50;
const productGrid = document.querySelector('.product-grid');
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function averageRating(product) {
    const ratings = Array.isArray(product.ratings) ? product.ratings : [];
    if (!ratings.length) return 0;
    return ratings.reduce((sum, rating) => sum + (Number(rating.rating) || 0), 0) / ratings.length;
}

function imageFromBackend(url) {
    if (!url) return 'product_images/testing.png';
    if (/^(https?:|data:|\/)/i.test(url)) return url;
    return url.startsWith('product_images/') ? url : 'product_images/' + url;
}

function fromBackend(product) {
    if (!product || product.id == null) throw new Error('The backend returned a product without an ID.');
    const price = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product.price);
    return {
        id: product.id,
        name: product.title || 'Untitled product',
        price: Number.isFinite(price) ? price : 0,
        rating: averageRating(product),
        img: imageFromBackend(product.imageUrl)
    };
}

let allProducts = [];
let activeFilter = 'suggested';
let searchText = '';

if (productGrid) {
    const notice = document.createElement('p');
    notice.style.cssText = 'text-align:center; margin-bottom:16px; font-size:14px;';
    productGrid.before(notice);

    function renderProducts(list) {
        productGrid.innerHTML = list.map(product => `
            <a href="${esc(productUrl(product))}" class="product-card">
                <img src="${esc(product.img)}" alt="${esc(product.name)}" onerror="this.onerror=null;this.src='product_images/testing.png'">
                <div class="product-info">
                    <h4>${esc(product.name)}</h4>
                    <p class="price">${money(product.price)}</p>
                    <div class="stars" style="--rating: ${product.rating}">★★★★★</div>
                </div>
            </a>
        `).join('');
    }

    function buildQuery() {
        const query = new URLSearchParams({ pageNumber: '0', pageSize: '100' });
        if (activeFilter === 'under') query.set('maxPrice', String(PRICE_SPLIT - 1));
        if (activeFilter === 'above') query.set('minPrice', String(PRICE_SPLIT));
        if (activeFilter === 'low') query.set('sort', 'price_low');
        return query.toString();
    }

    async function loadProducts() {
        productGrid.innerHTML = '<p class="no-results">Loading products...</p>';
        notice.textContent = '';

        try {
            // Correct endpoint format: /api/products?pageNumber=0&pageSize=100
            const page = await apiFetch('/api/products?' + buildQuery());
            if (!page || !Array.isArray(page.content)) {
                throw new Error('Unexpected response from /api/products. Expected a paginated response with a content array.');
            }
            allProducts = page.content.map(fromBackend);
        } catch (error) {
            console.error('Could not load products from the backend:', error);
            allProducts = [];
            notice.style.color = '#ff7a6b';
            notice.innerHTML = `${esc(error.message)} <button type="button" class="retry-products">Retry</button>`;
            const retry = notice.querySelector('.retry-products');
            if (retry) retry.addEventListener('click', loadProducts);
        }
        showProducts();
    }

    function showProducts() {
        let list = allProducts.filter(product => String(product.name).toLowerCase().includes(searchText));
        if (activeFilter === 'top') {
            list = list.filter(product => product.rating >= 4).sort((a, b) => b.rating - a.rating);
        }
        if (!list.length) {
            productGrid.innerHTML = '<p class="no-results">No cards found.</p>';
            return;
        }
        renderProducts(list);
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', event => {
        activeFilter = event.target.value;
        loadProducts();
    });

    const searchInput = document.querySelector('.search-box input');
    if (searchInput) searchInput.addEventListener('input', event => {
        searchText = event.target.value.toLowerCase().trim();
        showProducts();
    });

    loadProducts();
}

/* ---------- deal countdown ---------- */
function endOfWeek() {
    const date = new Date();
    date.setHours(23, 59, 59, 0);
    date.setDate(date.getDate() + (7 - date.getDay()) % 7);
    return date;
}

function tickCountdown() {
    const days = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const minutes = document.getElementById('cd-mins');
    const seconds = document.getElementById('cd-secs');
    if (!days || !hours || !minutes || !seconds) return;

    const diff = Math.max(0, endOfWeek() - new Date());
    const pad = value => String(value).padStart(2, '0');
    days.textContent = pad(Math.floor(diff / 86400000));
    hours.textContent = pad(Math.floor(diff / 3600000) % 24);
    minutes.textContent = pad(Math.floor(diff / 60000) % 60);
    seconds.textContent = pad(Math.floor(diff / 1000) % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- deal-of-the-week + voucher cards ---------- */
document.querySelectorAll('.deal-card, .voucher-item').forEach(card => {
    const text = selector => {
        const element = card.querySelector(selector);
        return element ? element.textContent.trim() : '';
    };
    const image = card.querySelector('img');
    const target = productUrl({
        name: text('h4'),
        price: text('.new') || text('.price'),
        img: image ? image.getAttribute('src') : ''
    });
    if (card.tagName === 'A') {
        card.href = target;
    } else {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => { window.location.href = target; });
    }
});

/* ---------- other-services carousel ---------- */
(function initServicesCarousel() {
    const servicesTrack = document.querySelector('.services-track');
    if (!servicesTrack) return;

    const groups = [
        { title: 'Streaming', items: [
            { id: 'netflix', name: 'Netflix Gift Card', price: '$15 ~ $100', rating: 4.5, img: 'product_images/testing.png' },
            { id: 'spotify', name: 'Spotify Premium Card', price: '$10 ~ $60', rating: 4.5, img: 'product_images/testing.png' },
            { name: 'Disney+ Gift Card', price: '$25 ~ $100', rating: 4, img: 'product_images/testing.png' }
        ]},
        { title: 'Shopping', items: [
            { id: 'amazon', name: 'Amazon Gift Card', price: '$10 ~ $500', rating: 5, img: 'product_images/testing.png' },
            { name: 'Google Play Gift Card', price: '$5 ~ $100', rating: 4.5, img: 'product_images/testing.png' },
            { name: 'Apple Gift Card', price: '$10 ~ $200', rating: 4.5, img: 'product_images/testing.png' }
        ]},
        { title: 'Chat & Social', items: [
            { name: 'Discord Nitro', price: '$10 ~ $100', rating: 4.5, img: 'product_images/testing.png' },
            { name: 'Telegram Premium', price: '$5 ~ $50', rating: 4, img: 'product_images/testing.png' },
            { name: 'Twitch Gift Card', price: '$10 ~ $100', rating: 4, img: 'product_images/testing.png' }
        ]},
        { title: 'Software', items: [
            { name: 'Microsoft 365', price: '$20 ~ $100', rating: 4.5, img: 'product_images/testing.png' },
            { name: 'Adobe Creative Cloud', price: '$30 ~ $300', rating: 4, img: 'product_images/testing.png' },
            { name: 'NordVPN Subscription', price: '$15 ~ $120', rating: 4.5, img: 'product_images/testing.png' }
        ]}
    ];

    servicesTrack.innerHTML = groups.map(group => `
        <div class="svc-panel">
            <div class="svc-panel-head">
                <h3>${esc(group.title)}</h3>
                <a href="site.html#featured" class="svc-more">View more</a>
            </div>
            ${group.items.map(item => `
                <a href="${esc(productUrl(item))}" class="svc-row">
                    <img src="${esc(item.img)}" alt="${esc(item.name)}">
                    <div class="svc-info">
                        <h4>${esc(item.name)}</h4>
                        <p class="svc-price">${esc(item.price)}</p>
                        <div class="stars" style="--rating: ${item.rating}">★★★★★</div>
                    </div>
                </a>
            `).join('')}
        </div>
    `).join('');

    function slide(direction) {
        const atEnd = servicesTrack.scrollLeft + servicesTrack.clientWidth >= servicesTrack.scrollWidth - 5;
        const atStart = servicesTrack.scrollLeft <= 5;
        if (direction > 0 && atEnd) return servicesTrack.scrollTo({ left: 0, behavior: 'smooth' });
        if (direction < 0 && atStart) return servicesTrack.scrollTo({ left: servicesTrack.scrollWidth, behavior: 'smooth' });
        servicesTrack.scrollBy({ left: direction * servicesTrack.clientWidth, behavior: 'smooth' });
    }

    let serviceTimer;
    const stop = () => clearInterval(serviceTimer);
    const start = () => { stop(); serviceTimer = setInterval(() => slide(1), 6000); };
    const nextButton = document.querySelector('.svc-next');
    const previousButton = document.querySelector('.svc-prev');
    if (nextButton) nextButton.addEventListener('click', () => { slide(1); start(); });
    if (previousButton) previousButton.addEventListener('click', () => { slide(-1); start(); });
    const wrapper = document.querySelector('.services-wrap');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stop);
        wrapper.addEventListener('mouseleave', start);
    }
    start();
})();
