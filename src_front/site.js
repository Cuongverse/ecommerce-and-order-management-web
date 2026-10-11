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

/* ---------- product cards ---------- */
const products = [
    { name: "VND Steam Wallet Việt Nam Gift Card", price: "420$", rating: 4.5, img: "product_images/testing.png" },
    { name: "USD Steam Wallet Card Order",         price: "67$",  rating: 4.5, img: "product_images/testing.png" },
    { name: "Euro Steam Wallet Gift Card",         price: "99$",  rating: 1.0, img: "product_images/testing.png" },
    { name: "PUBG PC Pass Steam",                  price: "30$",  rating: 4.5, img: "product_images/testing.png" },
    { name: "Random Steam Game Code",              price: "9$",   rating: 2.0, img: "product_images/testing.png" },
    { name: "Where Winds Meet Top-up",             price: "25$",  rating: 4.5, img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
    { name: "Fuckass cards",                       price: "67$",  rating: 3.35,img: "product_images/testing.png" },
];

const productGrid = document.querySelector('.product-grid');

function renderProducts(list) {
    productGrid.innerHTML = list.map(p => `
        <a href="${productUrl(p)}" class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <div class="product-info">
                <h4>${p.name}</h4>
                <p class="price">${p.price}</p>
                <div class="stars" style="--rating: ${p.rating}">★★★★★</div>
            </div>
        </a>
    `).join('');
}

renderProducts(products);

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
    under:     list => list.filter(p => parseFloat(p.price) < 50),
    above:     list => list.filter(p => parseFloat(p.price) >= 50),
    top:       list => list.filter(p => p.rating >= 4).sort((a, b) => b.rating - a.rating),
    low:       list => [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
};

let activeFilter = 'suggested';
let searchText = '';

function applyFilters() {
    const searched = products.filter(p => p.name.toLowerCase().includes(searchText));
    const result = filters[activeFilter](searched);

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

// your navbar search box now works together with the filters
document.querySelector('.search-box input').addEventListener('input', e => {
    searchText = e.target.value.toLowerCase();
    applyFilters();
});

applyFilters();

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