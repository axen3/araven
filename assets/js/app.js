const appDiv = document.getElementById("app");

async function loadUI(file) {
  // 1. Instantly hide old content to prevent scroll flash
  appDiv.style.opacity = "0";

  // 2. Load new page
  const html = await fetch(`ui/${file}.html`).then(r => r.text());
  appDiv.innerHTML = html;

  // 3. Force scroll to top immediately (no flash)
  window.scrollTo(0, 0);

  // 4. Fade in the new page smoothly
  requestAnimationFrame(() => {
    appDiv.style.transition = "opacity 0.25s ease";
    appDiv.style.opacity = "1";
  });
}

async function loadHeaderFooter() {
  const header = await fetch("components/header.html").then(r => r.text());
  document.getElementById("header").innerHTML = header;

  const footer = await fetch("components/footer.html").then(r => r.text());
  document.getElementById("footer").innerHTML = footer;

  // Mobile menu controls
  const toggle = document.querySelector(".mobile-menu-toggle");
  const closeBtn = document.querySelector(".mobile-menu-close");
  const nav = document.querySelector(".main-nav");

  const closeMenu = () => nav.classList.remove("active");

  toggle?.addEventListener("click", () => nav.classList.toggle("active"));
  closeBtn?.addEventListener("click", closeMenu);

  // Auto-close menu when any link is clicked
  document.querySelectorAll(".main-nav a[data-link]").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

function updateTitle(title) {
  document.title = title ? `${title} - Wally Store` : "Wally Store";
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const counter = document.getElementById("cart-counter");
  if (counter) counter.textContent = total;
}

async function router() {
  const hash = location.hash || "#/home";
  const [route, param] = hash.slice(2).split("/");

  if (route === "home") {
    await loadUI("home");
    updateTitle("Home");
    if (window.loadHome) await window.loadHome();
  } else if (route === "product") {
    await loadUI("product");
    updateTitle("");
    if (window.loadProduct) await window.loadProduct(param);
  } else if (route === "pages") {
    await loadUI("pages");
    if (window.loadPage) await window.loadPage(param);
  } else {
    location.hash = "#/home";
  }
  updateCartCounter();
  window.scrollTo(0, 0);
}

document.addEventListener("click", e => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    location.hash = link.getAttribute("href");
  }
});

window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  await router();
});