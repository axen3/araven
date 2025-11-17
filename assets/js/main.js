// Home page
window.loadHome = async function() {
  const container = document.getElementById("home-container");
  const res = await fetch("data/products.json");
  const products = await res.json();

  container.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="#/product/${p.id}">${p.title}</a>
      <img src="${p.images[0]}" alt="${p.title}">
      <p>$${p.price}</p>
    </div>
  `).join("");
};

// Product page
window.loadProduct = async function(id) {
  const titleEl = document.getElementById("product-title");
  const descEl = document.getElementById("product-description");
  const priceEl = document.getElementById("product-price");
  const stockEl = document.getElementById("product-stock");
  const imagesEl = document.getElementById("product-images");

  const res = await fetch("data/products.json");
  const products = await res.json();
  const product = products.find(p => p.id == id);

  if (!product) {
    document.getElementById("app").innerHTML = "<p>Product not found</p>";
    return;
  }

  titleEl.textContent = product.title;
  descEl.textContent = product.description;
  priceEl.textContent = `$${product.price}`;
  stockEl.textContent = `Available: ${product.stock}`;
  imagesEl.innerHTML = product.images.map(img => `<img src="${img}" alt="${product.title}">`).join("");

  // Fill hidden form
  document.getElementById("productId").value = product.id;
  document.getElementById("selectedUnits").value = 1;
  document.getElementById("selectedSize").value = product.sizes[0] || "";
  document.getElementById("selectedColor").value = product.colors[0] || "";
  document.getElementById("totalPrice").value = product.price;

  const orderForm = document.getElementById("order-form");
  orderForm.onsubmit = e => {
    e.preventDefault();
    alert("Order submitted! Check console log.");
    console.log({
      fullname: document.getElementById("fullname").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      phone: document.getElementById("phone").value,
      productId: product.id,
      size: document.getElementById("selectedSize").value,
      color: document.getElementById("selectedColor").value,
      units: document.getElementById("selectedUnits").value,
      totalPrice: document.getElementById("totalPrice").value
    });
    orderForm.reset();
  };
};

// Pages
window.loadPage = async function(page) {
  const titleEl = document.getElementById("page-title");
  const contentEl = document.getElementById("page-content");

  const res = await fetch("data/pages.json");
  const pages = await res.json();
  const content = pages[page];

  if (!content) {
    titleEl.textContent = "Page not found";
    contentEl.innerHTML = "";
    return;
  }

  titleEl.textContent = content.title;
  contentEl.innerHTML = content.content;
};