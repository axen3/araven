function addToCart(product, size, color, qty = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(i => i.id === product.id && i.size === size && i.color === color);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, size, color, qty });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  alert("Added to cart! 🛒");
}

window.loadHome = async function() {
  const container = document.getElementById("products-grid");
  const res = await fetch("data/products.json");
  const products = await res.json();

  container.innerHTML = products.map(p => {
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
            <div class="price-row">
              <span class="price">$${(p.price / 100).toFixed(2)}</span>
              ${hasDiscount ? `<span class="original-price">$${(p.originalPrice / 100).toFixed(2)}</span>` : ''}
            </div>
          </div>
        </a>
      </div>
    `;
  }).join("");
};

window.loadProduct = async function(id) {
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
  document.getElementById("product-stock").textContent = product.inStock ? "✓ In Stock" : "Out of Stock";
  document.getElementById("product-stock").style.color = product.inStock ? "var(--success)" : "var(--danger)";

  const priceEl = document.getElementById("product-price");
  priceEl.textContent = `$${(product.price / 100).toFixed(2)}`;
  if (product.originalPrice && product.originalPrice > product.price) {
    document.getElementById("original-price").textContent = `$${(product.originalPrice / 100).toFixed(2)}`;
    const discount = Math.round((1 - product.price / product.originalPrice) * 100);
    document.getElementById("discount-badge").textContent = `-${discount}%`;
    document.getElementById("discount-badge").style.display = "inline-block";
  } else {
    document.getElementById("discount-badge").style.display = "none";
  }

  // Modern Gallery
  const allImages = [product.image, ...(product.images || [])];
  const imagesDiv = document.getElementById("product-images");
  imagesDiv.innerHTML = `
    <div class="gallery-main">
      <img id="main-gallery-image" src="${allImages[0]}" alt="${product.name}">
    </div>
    ${allImages.length > 1 ? `
      <div class="gallery-thumbs">
        ${allImages.map((src, i) => `
          <img src="${src}" alt="thumb" class="${i===0 ? 'active' : ''}" onclick="
            document.getElementById('main-gallery-image').src = this.src;
            this.parentElement.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
          ">
        `).join("")}
      </div>
    ` : ''}
  `;

  // Size & Color selectors (unchanged from previous version)
  const sizeSelect = document.getElementById("selectedSize");
  if (product.sizes && product.sizes.length > 0) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option>${s}</option>`).join("");
  } else {
    sizeSelect.closest(".option-group").style.display = "none";
  }

  const colorDiv = document.getElementById("color-options");
  if (product.colors && product.colors.length > 0) {
    colorDiv.innerHTML = product.colors.map((c, i) => `
      <div class="color-swatch ${i===0?'active':''}" style="background:${c.hex}" data-color="${c.name}"></div>
    `).join("");
    colorDiv.querySelectorAll(".color-swatch").forEach(s => s.onclick = () => {
      colorDiv.querySelectorAll(".color-swatch").forEach(x => x.classList.remove("active"));
      s.classList.add("active");
    });
  } else {
    colorDiv.closest(".option-group").style.display = "none";
  }

  // Description blocks
  const descDiv = document.getElementById("description-blocks");
  descDiv.innerHTML = (product.descriptionBlocks || []).map(block => {
    if (block.type === "h1") return `<h2>${block.content}</h2>`;
    if (block.type === "paragraph") return `<p>${block.content}</p>`;
    if (block.type === "ul") return `<ul>${block.items.map(i => `<li>${i}</li>`).join("")}</ul>`;
    if (block.type === "image") return `<img src="${block.src}" alt="${block.alt}" loading="lazy">`;
    return "";
  }).join("");

  // Add to cart
  document.getElementById("add-to-cart").onclick = () => {
    const size = product.sizes?.length ? document.getElementById("selectedSize").value : null;
    const color = product.colors?.length ? document.querySelector(".color-swatch.active")?.dataset.color : null;
    const qty = parseInt(document.getElementById("selectedUnits").value) || 1;
    addToCart(product, size, color, qty);
  };

  updateTitle(product.name);
};

window.loadPage = async function(page) {
  const res = await fetch("data/pages.json");
  const pages = await res.json();
  const content = pages[page] || { title: "Not Found", content: "<p>Page not found.</p>" };
  document.getElementById("page-title").textContent = content.title;
  document.getElementById("page-content").innerHTML = content.content;
  updateTitle(content.title);
};