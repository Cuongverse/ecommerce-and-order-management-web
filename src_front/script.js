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
        <a href="" class="product-card">
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

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
    });
});

// your navbar search box now works together with the filters
document.querySelector('.search-box input').addEventListener('input', e => {
    searchText = e.target.value.toLowerCase();
    applyFilters();
});

applyFilters();