// ================ Simple Cart System ================
function addToCart(product, size, color, qty = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(i => 
    i.id === product.id && 
    i.size === size && 
    i.color === color
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image, 
      size, 
      color, 
      qty 
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const counter = document.getElementById("cart-counter");
  if (counter) counter.textContent = total;
}

// ================ Home Page ================
window.loadHome = async function (selectedCategory = null) {
  const container = document.getElementById("products-grid");
  const res = await fetch("data/products.json");
  const products = await res.json();

  // Filter products if a category is selected
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  // Update page title
  if (selectedCategory) {
    document.querySelector("h2") ? document.querySelector("h2").textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : null;
  } else {
    document.querySelector("h2") ? document.querySelector("h2").textContent = "All Products" : null;
  }

  container.innerHTML = filteredProducts.map(p => {
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
    const discount = hasDiscount ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

    return `
      <div class="product-card">
        ${hasDiscount ? `<div class="sale-badge">-${discount}%</div>` : ''}
        <a href="#/product/${p.id}" data-link>
          <div class="product-image-wrapper">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="card-content">
            <h3>${p.name}</h3>
            <p class="category-badge">${p.category}</p>
            <div class="price-row">
              <span class="price">MAD ${(p.price / 100).toFixed(2)}</span>
              ${hasDiscount ? `<span class="original-price">MAD ${(p.originalPrice / 100).toFixed(2)}</span>` : ''}
            </div>
          </div>
        </a>
      </div>
    `;
  }).join("");

  // Add category filter buttons above grid (only on home/category pages)
  const header = document.querySelector(".hero-section");
  if (header && !document.getElementById("category-filters")) {
    const categories = ["all", "clothing", "electronics", "wearables", "shoes", "misc"];
    const filterHTML = `<div id="category-filters" class="category-filters">
      ${categories.map(cat => `
        <a href="#/${cat === "all" ? "home" : "category/" + cat}" data-link class="category-btn ${(!selectedCategory && cat === "all") || selectedCategory === cat ? "active" : ""}">
          ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </a>
      `).join("")}
    </div>`;
    header.insertAdjacentHTML("afterend", filterHTML);
  }
};

// ================ Product Page ================
window.loadProduct = async function (id) {
  const res = await fetch("data/products.json");
  const products = await res.json();
  const product = products.find(p => p.id == id);

  if (!product) {
    document.getElementById("app").innerHTML = "<h2 style='text-align:center;padding:4rem;'>Product not found 😢</h2>";
    return;
  }

  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-category").textContent = product.category;
  document.getElementById("product-description").textContent = product.shortDescription;

  const stockEl = document.getElementById("product-stock");
  const stockTextEl = stockEl.querySelector(".stock-text");
  const stockIconEl = stockEl.querySelector(".stock-icon");

  if (product.inStock) {
    stockTextEl.textContent = "In Stock";
    stockIconEl.className = "fas fa-check-circle stock-icon";
    stockEl.classList.remove("out-of-stock");
  } else {
    stockTextEl.textContent = "Out of Stock";
    stockIconEl.className = "fas fa-times-circle stock-icon";
    stockEl.classList.add("out-of-stock");
  }

  const priceEl = document.getElementById("product-price");
  priceEl.textContent = `MAD ${(product.price / 100).toFixed(2)}`;

  const originalPriceEl = document.getElementById("original-price");
  const discountBadgeEl = document.getElementById("discount-badge");

  if (product.originalPrice && product.originalPrice > product.price) {
    originalPriceEl.textContent = `MAD ${(product.originalPrice / 100).toFixed(2)}`;
    originalPriceEl.style.display = "inline";
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    discountBadgeEl.textContent = `-${discount}%`;
    discountBadgeEl.style.display = "inline-block";
  } else {
    originalPriceEl.style.display = "none";
    discountBadgeEl.style.display = "none";
  }

  const allImages = [product.image, ...(product.images || [])];
  const imagesDiv = document.getElementById("product-images");

  imagesDiv.innerHTML = `
    <div class="gallery-main">
      <img id="main-gallery-image" src="${allImages[0]}" alt="${product.name}">
    </div>
    ${allImages.length > 1 ? `
      <div class="gallery-thumbs">
        ${allImages.map((src, i) => `
          <img src="${src}" alt="thumb" class="${i === 0 ? 'active' : ''}" onclick="
            document.getElementById('main-gallery-image').src = this.src;
            this.parentElement.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
          ">
        `).join("")}
      </div>
    ` : ''}
  `;

  const sizeSelect = document.getElementById("selectedSize");
  if (product.sizes && product.sizes.length > 0) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join("");
    sizeSelect.closest(".option-group").style.display = "block";
  } else {
    sizeSelect.closest(".option-group").style.display = "none";
  }

  const colorDiv = document.getElementById("color-options");
  if (product.colors && product.colors.length > 0) {
    colorDiv.innerHTML = product.colors.map((c, i) => `
      <div class="color-swatch ${i === 0 ? 'active' : ''}" style="background:${c.hex}" data-color="${c.name}" title="${c.name}"></div>
    `).join("");

    colorDiv.querySelectorAll(".color-swatch").forEach(swatch => {
      swatch.onclick = () => {
        colorDiv.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
      };
    });
    colorDiv.closest(".option-group").style.display = "block";
  } else {
    colorDiv.closest(".option-group").style.display = "none";
  }

  const qtyInput = document.getElementById("selectedUnits");
  const minusBtn = document.getElementById("qty-minus");
  const plusBtn = document.getElementById("qty-plus");

  const updateQtyButtons = () => {
    const val = parseInt(qtyInput.value);
    minusBtn.disabled = val <= 1;
    plusBtn.disabled = val >= 10;
  };

  minusBtn.onclick = () => {
    if (parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
      updateQtyButtons();
    }
  };

  plusBtn.onclick = () => {
    if (parseInt(qtyInput.value) < 10) {
      qtyInput.value = parseInt(qtyInput.value) + 1;
      updateQtyButtons();
    }
  };

  qtyInput.value = 1;
  updateQtyButtons();

  const descDiv = document.getElementById("description-blocks");
  descDiv.innerHTML = (product.descriptionBlocks || []).map(block => {
    if (block.type === "h1") return `<h2>${block.content}</h2>`;
    if (block.type === "paragraph") return `<p>${block.content}</p>`;
    if (block.type === "ul") return `<ul>${block.items.map(i => `<li>${i}</li>`).join("")}</ul>`;
    if (block.type === "image") return `<img src="${block.src}" alt="${block.alt}" loading="lazy">`;
    return "";
  }).join("");

  // Add to Cart
  document.getElementById("add-to-cart").onclick = () => {
    const size = product.sizes?.length ? document.getElementById("selectedSize").value : null;
    const color = product.colors?.length ? document.querySelector(".color-swatch.active")?.dataset.color : null;
    const qty = parseInt(qtyInput.value) || 1;

    addToCart(product, size, color, qty);
  };

  // Buy Now – silent + instant checkout
  document.getElementById("buy-now").onclick = () => {
    const size = product.sizes?.length ? document.getElementById("selectedSize").value : null;
    const color = product.colors?.length ? document.querySelector(".color-swatch.active")?.dataset.color : null;
    const qty = parseInt(qtyInput.value) || 1;

    addToCart(product, size, color, qty);
    location.hash = "#/checkout";
  };

  updateTitle(product.name);
};

// ================ Static Pages ================
window.loadPage = async function (page) {
  const res = await fetch("data/pages.json");
  const pages = await res.json();
  const content = pages[page] || { title: "Page Not Found", content: "<p>Sorry, this page does not exist.</p>" };

  document.getElementById("page-title").textContent = content.title;
  document.getElementById("page-content").innerHTML = content.content;
  updateTitle(content.title);
};

// ================ Checkout Page – ALWAYS AVAILABLE & FIXED ================
window.loadCheckout = function () {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    document.getElementById("app").innerHTML = `
      <div style="text-align:center;padding:6rem 1rem;">
        <h2>Your cart is empty 😔</h2>
        <a href="#/home" data-link class="cta-button">Continue Shopping</a>
      </div>`;
    return;
  }

  const itemsHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>${item.size ? 'Size: ' + item.size + ' • ' : ''}${item.color ? 'Color: ' + item.color + ' • ' : ''}Qty: ${item.qty}</p>
        <p>MAD ${(item.price / 100 * item.qty).toFixed(2)}</p>
      </div>
      <button class="remove-item-btn" data-index="${index}">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join("");

  const cartItemsEl = document.getElementById("cart-items");
  if (cartItemsEl) cartItemsEl.innerHTML = itemsHTML;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0) / 100;
  const totalEl = document.getElementById("grand-total");
  if (totalEl) totalEl.textContent = total.toFixed(2);

  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCounter();
      loadCheckout();
    };
  });

  const form = document.getElementById("cod-form");
  if (form) {
    form.onsubmit = async e => {
      e.preventDefault();
      const btn = form.querySelector(".place-order-btn");
      btn.disabled = true;
      btn.textContent = "Placing Order...";

      const orderData = {
        orderId: Date.now(),
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        notes: document.getElementById("notes").value.trim() || "No notes",
        items: cart.map(i => `${i.name} (${i.qty}x)`).join(" • "),
        total: total.toFixed(2)
      };

      const webhookURL = "https://hook.make.com/YOUR_WEBHOOK_HERE"; // ← Replace with your real URL

      try {
        await fetch(webhookURL, {
          method: "POST",
          body: JSON.stringify(orderData),
          headers: { "Content-Type": "application/json" }
        });
        localStorage.removeItem("cart");
        updateCartCounter();
        location.hash = "#/thankyou";
      } catch (err) {
        alert("Order failed. Please try again or contact us.");
        btn.disabled = false;
        btn.textContent = "Place Order";
      }
    };
  }
};
window.addEventListener("hashchange", () => {
  if (location.hash === "#/home" || location.hash.startsWith("#/category/")) {
    const filters = document.getElementById("category-filters");
    if (filters) {
      // Get header height (works even if header size changes)
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 80;

      // Calculate exact position so filters touch the top of viewport
      const filtersTop = filters.getBoundingClientRect().top + window.pageYOffset;
      const targetScroll = filtersTop - headerHeight;

      // Smooth scroll to that exact position
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    }
  }
});