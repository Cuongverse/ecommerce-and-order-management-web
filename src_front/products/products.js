/*
 * products.js - renders a product detail page.
 * Numeric IDs are loaded from the real backend. Non-numeric IDs are
 * intentional static/demo cards from data.js.
 */
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

/* ---------- automatic images ---------- */
const IMG_DIR = '../product_images/';
const imageFor = product => {
    const src = (product && product.img) || `${(product && product.id) || 'product'}.png`;
    if (/^(https?:|data:|\/|\.\.\/)/i.test(src)) return src;
    return src.startsWith('product_images/') ? '../' + src : IMG_DIR + src;
};

function placeholder(name) {
    const initials = String(name || 'Product').split(/\s+/).filter(Boolean).slice(0, 2)
        .map(word => word[0]).join('').toUpperCase();
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#ff523b"/><stop offset="1" stop-color="#3b6cff"/></linearGradient></defs>` +
        `<rect width="300" height="300" fill="url(#g)"/>` +
        `<text x="50%" y="54%" font-family="Arial, sans-serif" font-size="110" font-weight="700" ` +
        `fill="#fff" text-anchor="middle" dominant-baseline="middle">${esc(initials)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function imgTag(product, className) {
    return `<img ${className ? `class="${esc(className)}" ` : ''}src="${esc(imageFor(product))}" alt="${esc(product.name)}" data-fallback="${esc(product.name)}">`;
}

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
    let hash = 0;
    for (const char of String(name || 'Customer')) hash = (hash * 31 + char.charCodeAt(0)) % 360;
    return `hsl(${hash} 55% 45%)`;
}

function toast(message) {
    const element = $('#pp-toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2200);
}

/* =========================================================
   BACKEND PRODUCT -> the view model used by this page.
   This branch stores product-level prices and size/stock choices;
   it does not use SKU records.
   ========================================================= */
function toProduct(product) {
    if (!product || product.id == null) throw new Error('The backend returned an invalid product record.');

    const basePrice = Number(product.price) || 0;
    const discountedPrice = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : basePrice;
    const oldPrice = basePrice > discountedPrice ? basePrice : undefined;
    const feedback = buildFeedback(product.ratings, product.reviews);
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    const variants = sizes.length
        ? sizes.map(size => ({
            label: `${product.title || 'Product'} - ${size.name || 'Standard'}`,
            size: size.name || '',
            price: discountedPrice,
            old: oldPrice,
            stockQuantity: Math.max(0, Math.min(Number(product.quantity) || 0, Number(size.quantity) || 0)),
            stock: Math.min(Number(product.quantity) || 0, Number(size.quantity) || 0) > 0
        }))
        : [{
            label: product.title || 'Product',
            price: discountedPrice,
            old: oldPrice,
            stockQuantity: Math.max(0, Number(product.quantity) || 0),
            stock: Number(product.quantity) > 0
        }];

    return {
        id: String(product.id),
        productId: product.id,
        name: product.title || 'Untitled product',
        category: (product.category && product.category.name) || 'Other',
        rating: feedback.rating,
        reviewCount: feedback.reviewCount,
        img: product.imageUrl || undefined,
        description: product.description ? String(product.description).split(/\n+/) : [],
        variants,
        reviews: feedback.reviews
    };
}

/* =========================================================
   PICK THE PRODUCT FROM THE URL
   ========================================================= */
const params = new URLSearchParams(window.location.search);
const staticProducts = typeof PRODUCTS !== 'undefined' ? PRODUCTS : {};
const wantedId = params.get('id') || '';

async function loadProduct() {
    if (!wantedId) throw new Error('No product was selected. Return to the store and choose a product.');

    // Numeric IDs always mean database records. Do not silently replace a failed
    // backend request with a sample card, because that makes a broken connection
    // look like a successful product load.
    if (/^\d+$/.test(wantedId)) {
        const response = await apiFetch('/api/products/id/' + encodeURIComponent(wantedId));
        return toProduct(response);
    }

    // Non-numeric IDs are allowed only when they exist in data.js.
    // Unknown slugs must not become fictional, purchasable-looking products.
    if (!Object.prototype.hasOwnProperty.call(staticProducts, wantedId)) {
        throw new Error('This product is not in the catalog. Return to the store and choose an available item.');
    }
    const data = staticProducts[wantedId];
    return { id: wantedId, ...data, isDemo: true };
}

async function loadRelated(product) {
    try {
        const page = await apiFetch('/api/products?pageNumber=0&pageSize=12');
        if (!page || !Array.isArray(page.content)) return [];
        return page.content.map(toProduct)
            .filter(item => item.id !== product.id)
            .sort((a, b) => (b.category === product.category) - (a.category === product.category))
            .slice(0, 4);
    } catch (error) {
        console.warn('Could not load related products:', error.message);
        return [];
    }
}

function showProductLoadError(error) {
    const page = $('#pp-page');
    if (!page) return;
    const message = error && error.message ? error.message : 'An unexpected error occurred.';
    page.innerHTML = `
        <div class="pp-wrap" style="padding:48px 16px;">
            <section class="pp-card" style="max-width:720px;margin:0 auto;">
                <h2>Unable to load this product</h2>
                <p>${esc(message)}</p>
                <p>Please check the backend connection and try again.</p>
                <div class="pp-actions" style="margin-top:20px;">
                    <button type="button" class="pp-btn primary" id="pp-retry">Retry</button>
                    <a class="pp-btn ghost" href="../site.html#featured">Back to store</a>
                </div>
            </section>
        </div>`;
    const retry = $('#pp-retry');
    if (retry) retry.addEventListener('click', () => window.location.reload());
}

(async function start() {
    try {
        const product = await loadProduct();
        initPage(product);
        await renderRelated(product);
        if (Auth.isLoggedIn()) refreshFeedback(product);
    } catch (error) {
        console.error('Could not load product:', error);
        showProductLoadError(error);
    }
})();

/* =========================================================
   RENDER
   ========================================================= */
function initPage(product) {
    const state = {
        i: Math.max(0, product.variants.findIndex(variant => variant.stock !== false)),
        qty: 1
    };

    document.title = `${product.name} | GiftCard`;

    const cover = $('#pp-cover');
    cover.src = imageFor(product);
    cover.alt = product.name;
    cover.dataset.fallback = product.name;
    $('#pp-title').textContent = product.name;
    $('#pp-stars').style.setProperty('--rating', product.rating);
    $('#pp-rating-text').textContent = product.reviewCount
        ? `${product.rating.toFixed(1)} / 5 · ${product.reviewCount.toLocaleString('en-US')} ratings`
        : 'No ratings yet';

    const favorite = $('#pp-fav');
    favorite.addEventListener('click', () => {
        const active = favorite.classList.toggle('on');
        favorite.setAttribute('aria-pressed', String(active));
        favorite.textContent = active ? '♥ Favorited' : '♡ Favorite';
    });

    if (product.isDemo) {
        const extraNotice = product.notice ? ` ${product.notice.title}: ${product.notice.text}` : '';
        $('#pp-notice-title').textContent = 'Demo product';
        $('#pp-notice-text').textContent = 'This is static sample data for display only. It is not stored in the live catalog and cannot be purchased.' + extraNotice;
        $('#pp-notice').hidden = false;
    } else if (product.notice) {
        $('#pp-notice-title').textContent = '⚠️ ' + product.notice.title;
        $('#pp-notice-text').textContent = product.notice.text;
        $('#pp-notice').hidden = false;
    }

    if (product.description && product.description.length) {
        $('#pp-desc').innerHTML = product.description.map(text => `<p>${esc(text)}</p>`).join('');
        $('#pp-desc-card').hidden = false;
        setupCollapse('#pp-desc', '#pp-desc-more');
    }

    if (product.instructions && product.instructions.length) {
        $('#pp-guide').innerHTML = `<ol class="pp-steps">${product.instructions.map(text => `<li>${esc(text)}</li>`).join('')}</ol>`;
        $('#pp-guide-card').hidden = false;
        setupCollapse('#pp-guide', '#pp-guide-more');
    }

    function renderVariants() {
        $('#pp-variants').innerHTML = product.variants.map((variant, index) => {
            const outOfStock = variant.stock === false;
            const discount = variant.old && variant.old > variant.price
                ? Math.round((1 - variant.price / variant.old) * 100) : 0;
            return `
                <button type="button" class="pp-variant${index === state.i ? ' active' : ''}" data-i="${index}" ${outOfStock ? 'disabled' : ''}>
                    ${imgTag(product)}
                    <span class="pp-v-info">
                        <span class="pp-v-name">${esc(variant.label)}</span>
                        <span class="pp-v-price">${money(variant.price)}${variant.old ? `<s>${money(variant.old)}</s>` : ''}</span>
                        <span class="pp-v-meta">
                            ${product.isDemo ? '<em class="out">Demo only</em>' : (outOfStock ? '<em class="out">Out of stock</em>' : '<em class="in">In stock</em>')}
                            ${discount ? `<b class="pp-disc">-${discount}%</b>` : ''}
                        </span>
                    </span>
                </button>`;
        }).join('');
        armFallbacks($('#pp-variants'));
    }

    $('#pp-variants').addEventListener('click', event => {
        const button = event.target.closest('.pp-variant');
        if (!button || button.disabled) return;
        state.i = Number(button.dataset.i);
        renderVariants();
        updateTotals();
    });

    function updateTotals() {
        const variant = product.variants[state.i];
        const available = product.isDemo
            ? 0
            : Math.max(0, Number(variant.stockQuantity ?? (variant.stock === false ? 0 : 10)) || 0);
        const maxQuantity = Math.min(10, available);
        if (maxQuantity > 0) state.qty = Math.min(state.qty, maxQuantity);
        const original = (variant.old || variant.price) * state.qty;
        const total = variant.price * state.qty;
        const outOfStock = variant.stock === false || maxQuantity < 1;
        $('#pp-qty').textContent = state.qty;
        $('#pp-selected').textContent = `Selected: ${variant.label}`;
        $('#pp-orig').textContent = money(original);
        $('#pp-save').textContent = money(original - total);
        $('#pp-total').textContent = money(total);
        $('#pp-minus').disabled = Boolean(product.isDemo) || state.qty <= 1;
        $('#pp-plus').disabled = Boolean(product.isDemo) || outOfStock || state.qty >= maxQuantity;
        $('#pp-add').disabled = outOfStock;
        $('#pp-buy').disabled = outOfStock;
    }

    $('#pp-minus').addEventListener('click', () => { state.qty = Math.max(1, state.qty - 1); updateTotals(); });
    $('#pp-plus').addEventListener('click', () => { state.qty += 1; updateTotals(); });

    /* Add to cart: the backend calculates the price from its product record. */
    async function addToCart(goToCart) {
        if (!product.productId) {
            toast('This is a demo card and is not stored in the database yet.');
            return;
        }
        if (!Auth.isLoggedIn()) {
            window.location.href = ROOT + 'Auth.html?next=' + encodeURIComponent(window.location.href);
            return;
        }

        const variant = product.variants[state.i];
        const requestedQuantity = state.qty;
        const size = variant.size || 'Standard';
        let addedQuantity = 0;
        $('#pp-add').disabled = true;
        $('#pp-buy').disabled = true;
        try {
            const cart = await apiFetch('/api/cart');
            const cartItems = Array.isArray(cart && cart.cartItems) ? cart.cartItems : [];
            const existing = cartItems.find(item =>
                String(item.product && item.product.id) === String(product.productId) &&
                String(item.size || '') === size
            );
            const currentQuantity = existing ? Number(existing.quantity) || 0 : 0;
            const available = Number(variant.stockQuantity);
            if (Number.isFinite(available) && currentQuantity + requestedQuantity > available) {
                throw new Error(`Only ${Math.max(0, available - currentQuantity)} more unit(s) of this option are available.`);
            }

            if (existing) {
                // Updating an existing line uses CartItemService and avoids a
                // backend CartService branch that currently has an uninjected repository.
                await apiFetch('/api/cart_items/update/' + existing.id, {
                    method: 'PUT', body: { quantity: currentQuantity + requestedQuantity, size }
                });
                addedQuantity = requestedQuantity;
            } else {
                // The backend's create-item service currently initializes a new line at quantity 1.
                // Create it once, then use the dedicated update endpoint for the remaining quantity.
                await apiFetch('/api/cart/add', {
                    method: 'PUT', body: { productId: product.productId, size, quantity: 1 }
                });
                addedQuantity = 1;

                if (requestedQuantity > 1) {
                    const refreshedCart = await apiFetch('/api/cart');
                    const created = (refreshedCart.cartItems || []).find(item =>
                        String(item.product && item.product.id) === String(product.productId) &&
                        String(item.size || '') === size
                    );
                    if (!created) throw new Error('The cart item was created, but the frontend could not find it to set the requested quantity.');
                    await apiFetch('/api/cart_items/update/' + created.id, {
                        method: 'PUT', body: { quantity: requestedQuantity, size }
                    });
                    addedQuantity = requestedQuantity;
                }
            }

            if (goToCart) {
                window.location.href = ROOT + 'Cart.html';
                return;
            }
            toast('Added ' + addedQuantity + (addedQuantity === 1 ? ' item' : ' items') + ' to cart ✓');
        } catch (error) {
            if (addedQuantity > 0) {
                toast(`Added ${addedQuantity} of ${requestedQuantity}. Opening cart to review.`);
                window.setTimeout(() => { window.location.href = ROOT + 'Cart.html'; }, 900);
                return;
            }
            toast(error.message);
        }
        updateTotals();
    }

    $('#pp-add').addEventListener('click', () => addToCart(false));
    $('#pp-buy').addEventListener('click', () => addToCart(true));
    renderReviews(product);
    renderVariants();
    updateTotals();
    armFallbacks();
}

/* ---------- recommended products ---------- */
async function renderRelated(product) {
    const others = await loadRelated(product);
    if (others.length) {
        $('#pp-rel-list').innerHTML = others.map(item => {
            const prices = item.variants.map(variant => Number(variant.price) || 0);
            const from = prices.length ? Math.min(...prices) : 0;
            return `
                <a href="products.html?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}" class="pp-rel">
                    ${imgTag(item)}
                    <div class="pp-rel-info">
                        <h4>${esc(item.name)}</h4>
                        <span class="pp-rel-price">From ${money(from)}</span>
                        <div class="stars" style="--rating: ${item.rating}">★★★★★</div>
                    </div>
                </a>`;
        }).join('');
        armFallbacks($('#pp-rel-list'));
    } else {
        $('#pp-related').hidden = true;
    }
}

function setupCollapse(boxSelector, buttonSelector) {
    const box = $(boxSelector);
    const button = $(buttonSelector);
    if (!box || !button) return;
    if (box.scrollHeight <= 175) {
        box.classList.add('open');
        button.hidden = true;
        return;
    }
    button.addEventListener('click', () => {
        const open = box.classList.toggle('open');
        button.textContent = open ? 'Show less ▲' : 'See more ▼';
    });
}

/* =========================================================
   RATINGS + REVIEWS
   GET  /api/reviews/product/{id}    GET  /api/ratings/product/{id}
   POST /api/ratings/create          POST /api/reviews/create
   ========================================================= */
const dateOf = value => value
    ? (Array.isArray(value) ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0) : new Date(value))
    : new Date(0);

function buildFeedback(ratings, reviews) {
    ratings = Array.isArray(ratings) ? ratings : [];
    reviews = Array.isArray(reviews) ? reviews : [];
    const byUser = {};
    ratings.forEach(rating => { if (rating.user) byUser[rating.user.id] = rating.rating; });

    return {
        rating: ratings.length ? ratings.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / ratings.length : 0,
        reviewCount: ratings.length,
        reviews: [...reviews].sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt)).map(review => {
            const user = review.user || {};
            const date = dateOf(review.createdAt);
            return {
                user: ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || 'Customer',
                date: isNaN(date) || date.getTime() === 0 ? '' : date.toLocaleDateString('en-US', { dateStyle: 'medium' }),
                rating: user.id != null ? byUser[user.id] : undefined,
                text: review.review || ''
            };
        })
    };
}

function renderReviews(product) {
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
    $('#pp-rev-list').innerHTML = reviews.length ? reviews.map(review => `
        <div class="pp-review">
            <div class="pp-avatar" style="background:${avatarColor(review.user)}">${esc(String(review.user || 'C')[0].toUpperCase())}</div>
            <div class="pp-rev-body">
                <div class="pp-rev-top">
                    <b>${esc(review.user)}</b>
                    ${review.rating != null ? `<div class="stars" style="--rating: ${review.rating}">★★★★★</div>` : ''}
                </div>
                <div class="pp-rev-date">${esc(review.date)}</div>
                <p>${esc(review.text)}</p>
            </div>
        </div>`).join('') : '<p>No reviews yet.</p>';

    renderReviewForm(product);
}

async function refreshFeedback(product) {
    if (!product.productId) return;
    try {
        let ratings;
        let reviews;
        try {
            [reviews, ratings] = await Promise.all([
                apiFetch('/api/reviews/product/' + product.productId),
                apiFetch('/api/ratings/product/' + product.productId)
            ]);
        } catch {
            const fresh = await apiFetch('/api/products/id/' + product.productId);
            ratings = fresh.ratings;
            reviews = fresh.reviews;
        }
        Object.assign(product, buildFeedback(ratings, reviews));
        renderReviews(product);
    } catch (error) {
        console.warn('Could not refresh reviews:', error.message);
    }
}

function renderReviewForm(product) {
    let box = $('#pp-rev-form');
    if (!box) {
        box = document.createElement('div');
        box.id = 'pp-rev-form';
        $('#pp-rev-list').before(box);

        const style = document.createElement('style');
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

    if (!product.productId) {
        box.innerHTML = '';
        return;
    }

    if (!Auth.isLoggedIn()) {
        box.innerHTML = `<p class="rf-note"><a href="${ROOT}Auth.html?next=${encodeURIComponent(window.location.href)}">Log in</a> to rate and review this product.</p>`;
        return;
    }

    box.innerHTML = `
        <form class="rf" novalidate>
            <div class="rf-stars" role="group" aria-label="Your rating">
                ${[1, 2, 3, 4, 5].map(number => `<button type="button" data-v="${number}" aria-label="${number} star${number > 1 ? 's' : ''}">★</button>`).join('')}
            </div>
            <textarea name="review" rows="3" minlength="10" maxlength="200" placeholder="Write a review (10–200 characters; optional when rating with stars)"></textarea>
            <p class="rf-msg" role="alert"></p>
            <button type="submit" class="rf-btn">Submit</button>
        </form>`;

    const form = box.querySelector('form');
    const stars = form.querySelectorAll('.rf-stars button');
    let picked = 0;

    stars.forEach(button => button.addEventListener('click', () => {
        picked = Number(button.dataset.v);
        stars.forEach(star => star.classList.toggle('on', Number(star.dataset.v) <= picked));
    }));

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const message = form.querySelector('.rf-msg');
        const button = form.querySelector('.rf-btn');
        const reviewText = form.elements.namedItem('review').value.trim();
        message.textContent = '';

        if (!picked && !reviewText) {
            message.textContent = 'Pick a star rating or write a review.';
            return;
        }
        if (reviewText && (reviewText.length < 10 || reviewText.length > 200)) {
            message.textContent = 'A written review must be between 10 and 200 characters.';
            return;
        }

        button.disabled = true;
        try {
            if (picked) await apiFetch('/api/ratings/create', {
                method: 'POST', body: { productId: product.productId, rating: picked }
            });
            if (reviewText) await apiFetch('/api/reviews/create', {
                method: 'POST', body: { productId: product.productId, review: reviewText }
            });
            await refreshFeedback(product);
            toast('Thanks for your feedback ✓');
        } catch (error) {
            message.textContent = error.message;
            button.disabled = false;
        }
    });
}
