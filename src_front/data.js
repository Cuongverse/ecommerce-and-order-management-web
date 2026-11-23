/* =========================================================
   data.js - ONE source of truth for every product.
   Loaded by site.html AND products/products.html, so editing a
   name, price or description here updates both pages.

   Later a backend replaces this file: PRODUCTS would come from
   fetch('/api/products') instead of being typed in here.

   img = a file name inside product_images/ (or a full https:// link).
         Delete the img line and the pages look for <id>.png instead.
   ========================================================= */
const REVIEWS_SAMPLE = [
    { user: "fcbuum",      date: "Aug 27, 2026", rating: 5, text: "Fast and easy, code arrived in seconds." },
    { user: "Quang H.",    date: "Aug 26, 2026", rating: 5, text: "Very reliable. Bought here many times already." },
    { user: "kynosu",      date: "Aug 26, 2026", rating: 4, text: "Good service, support answered quickly." },
    { user: "Lazy Tom",    date: "Aug 26, 2026", rating: 5, text: "No issues at all, will buy again." },
    { user: "phamchautan", date: "Aug 25, 2026", rating: 5, text: "Great." },
    { user: "Mai Anh",     date: "Aug 24, 2026", rating: 4, text: "Cheaper than other shops I checked." },
];

const PRODUCTS = {
    "steam-vnd": {
        name: "Steam Wallet Gift Card - VND (Vietnam)",
        category: "Gaming",
        rating: 4.5,
        reviewCount: 1280,
        img: "testing.png",
        notice: {
            title: "Important notice",
            text: "This card tops up a Vietnam-region Steam wallet. Balance is converted to VND automatically, so make sure your account region matches before you buy."
        },
        description: [
            "A Steam Wallet card lets you add funds to your Steam account and spend them on games, DLC and in-game items.",
            "Codes are delivered instantly after payment and can be redeemed straight away on the Steam website or in the Steam client.",
            "Please read the product name carefully before purchase, since some codes carry regional restrictions."
        ],
        instructions: [
            "Sign in to your Steam account in the client or on the website.",
            "Open Account details, then choose Redeem a Steam Gift Card or Wallet Code.",
            "Paste the code you received and confirm.",
            "The balance appears in your wallet immediately."
        ],
        variants: [
            { label: "20,000 VND Steam Wallet Card",    price: 1.30,  old: 1.50 },
            { label: "50,000 VND Steam Wallet Card",    price: 2.60,  old: 2.90 },
            { label: "100,000 VND Steam Wallet Card",   price: 4.90,  old: 5.40 },
            { label: "200,000 VND Steam Wallet Card",   price: 9.50,  old: 10.50 },
            { label: "500,000 VND Steam Wallet Card",   price: 22.80, old: 25.00 },
            { label: "1,000,000 VND Steam Wallet Card", price: 45.00, old: 49.00, stock: false },
        ],
        reviews: REVIEWS_SAMPLE,
    },

    "steam-usd": {
        name: "Steam Wallet Gift Card - VND",
        category: "Gaming",
        rating: 4.5,
        reviewCount: 940,
        img: "testing.png",
        description: ["US-region Steam wallet codes, delivered instantly."],
        variants: [
            { label: "20,000 VND Steam Wallet Card",  price: 20000 },
            { label: "50,000 VND Steam Wallet Card", price: 50000 },
            { label: "200,000 VND Steam Wallet Card", price: 200000 },
            { label: "500,000 VND Steam Wallet Card", price: 500000 },
        ],
        reviews: REVIEWS_SAMPLE,
    },

    "netflix": {
        name: "Netflix Gift Card",
        category: "Streaming",
        rating: 4.5,
        reviewCount: 2210,
        img: "testing.png",
        description: ["Redeem on netflix.com/redeem to add credit to your account."],
        instructions: ["Go to netflix.com/redeem.", "Enter the code.", "Credit is applied to your next bill."],
        variants: [
            { label: "375,000 VND Netflix Gift Card",  price: 375000 },
            { label: "625,000 VND Netflix Gift Card",  price: 612500, old: 625000 },
            { label: "1,250,000 VND Netflix Gift Card",  price: 1200000, old: 1250000 },
            { label: "2,500,000 VND Netflix Gift Card", price: 2375000, old: 2500000 },
        ],
        reviews: REVIEWS_SAMPLE,
    },

    "spotify": {
        name: "Spotify Premium Card",
        category: "Streaming",
        rating: 4.5,
        reviewCount: 1530,
        img: "testing.png",
        description: ["Add Premium time to your Spotify account."],
        variants: [
            { label: "1 month Spotify Premium",  price: 250000 },
            { label: "3 months Spotify Premium", price: 725000, old: 750000 },
            { label: "6 months Spotify Premium", price: 1375000, old: 1500000 },
        ],
        reviews: REVIEWS_SAMPLE,
    },

    "amazon": {
        name: "Amazon Gift Card",
        category: "Shopping",
        rating: 5,
        reviewCount: 3100,
        img: "testing.png",
        description: ["Use on Amazon for millions of items."],
        variants: [
            { label: "250,000 VND Amazon Gift Card",  price: 250000 },
            { label: "1,250,000 VND Amazon Gift Card",  price: 1225000, old: 1250000 },
            { label: "2,500,000 VND Amazon Gift Card", price: 2425000, old: 2500000 },
            { label: "12,500,000 VND Amazon Gift Card", price: 12000000, old: 12500000 },
        ],
        reviews: REVIEWS_SAMPLE,
    },
};