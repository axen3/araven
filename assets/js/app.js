// Load header/footer
async function loadHeaderFooter() {
  const header = await fetch("components/header.html").then(r => r.text());
  document.getElementById("header").innerHTML = header;

  const footer = await fetch("components/footer.html").then(r => r.text());
  document.getElementById("footer").innerHTML = footer;
}

// Load UI file into #app
async function loadUI(file) {
  const html = await fetch(`ui/${file}.html`).then(r => r.text());
  document.getElementById("app").innerHTML = html;
}

// SPA router using hash
async function router() {
  const hash = location.hash || "#/home";
  const [route, param] = hash.slice(2).split("/");

  if (route === "home") {
    await loadUI("home");
    if (window.loadHome) window.loadHome();
  } else if (route === "product") {
    await loadUI("product");
    if (window.loadProduct) window.loadProduct(param);
  } else if (route === "pages") {
    await loadUI("pages");
    if (window.loadPage) window.loadPage(param);
  } else {
    await loadUI("home");
    if (window.loadHome) window.loadHome();
  }
}

// Listen to hash changes
window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  router();
});