// Main App Logic
const App = {
    products: [],
    cart: [],

    async init() {
        await this.loadProducts();
        this.updateCartCount();
        
        // Handle GitHub Pages redirect from 404.html
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect) {
            window.history.replaceState({}, '', redirect);
        }
    },

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    renderHomePage() {
        const content = document.getElementById('content');
        if (!content) return;

        const productsHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description.substring(0, 80)}...</p>
                    <div class="product-footer">
                        <span class="price">$${product.price}</span>
                        <a href="/product?id=${product.id}" onclick="navigate('/product?id=${product.id}', event)" class="btn">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="hero">
                <h2>Welcome to ModernStore</h2>
                <p>Discover amazing products at great prices</p>
            </div>
            <div class="products-grid">
                ${productsHTML}
            </div>
        `;
    },

    addToCart(id) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(id);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        alert('Product added to cart!');
    },

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = cart.length;
            badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
        }
    }
};