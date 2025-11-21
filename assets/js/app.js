const appDiv = document.getElementById("app");

async function loadUI(file) {
    appDiv.style.opacity = "0";
    const html = await fetch(`ui/${file}.html`).then(r => r.text());
    appDiv.innerHTML = html;
    // ONLY scroll to top for product, checkout, pages – NOT for home/category
  const currentRoute = location.hash.slice(2).split("/")[0];
  if (!["home", "category"].includes(currentRoute)) {
    window.scrollTo(0, 0);
  }
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

    const toggle = document.querySelector(".mobile-menu-toggle");
    const closeBtn = document.querySelector(".mobile-menu-close");
    const nav = document.querySelector(".main-nav");
    const closeMenu = () => nav.classList.remove("active");

    toggle?.addEventListener("click", () => nav.classList.toggle("active"));
    closeBtn?.addEventListener("click", closeMenu);
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

    if (route === "home" || route === "category") {
        await loadUI("home");  // Home and category use the same grid
        const category = (route === "category") ? param : null;
        if (window.loadHome) await window.loadHome(category);
        updateTitle(category ? param.charAt(0).toUpperCase() + param.slice(1) : "Home");

    } else if (route === "product") {
        await loadUI("product");
        if (window.loadProduct) await window.loadProduct(param);

    }  else if (route === "pages" && param) {
        let htmlContent = "";
        let pageTitle = "Page Not Found";

        // Special handling for contact page – load web3forms script FIRST
        if (param === "contact") {
            if (!document.querySelector('script[src="https://web3forms.com/client/script.js"]')) {
                const script = document.createElement("script");
                script.src = "https://web3forms.com/client/script.js";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        }

        try {
            const response = await fetch(`pages/${param}.html`);
            if (response.ok) {
                htmlContent = await response.text();
                pageTitle = param.charAt(0).toUpperCase() + param.slice(1).replace(/-/g, " ");
            } else {
                htmlContent = await fetch("pages/404.html").then(r => r.text());
            }
        } catch (err) {
            htmlContent = await fetch("pages/404.html").then(r => r.text());
        }

        appDiv.innerHTML = htmlContent;

        // Re-render hCaptcha if on contact page (script is now loaded)
        if (param === "contact") {
            setTimeout(() => {
                const captchaDiv = document.querySelector('.h-captcha[data-captcha="true"]');
                if (captchaDiv && window.hcaptcha) {
                    window.hcaptcha.render(captchaDiv);
                }
            }, 500);
        }

        requestAnimationFrame(() => {
            appDiv.style.transition = "opacity 0.25s ease";
            appDiv.style.opacity = "1";
        });

        updateTitle(pageTitle + " - Wally Store");
        window.scrollTo(0, 0);
    
    } else if (route === "checkout") {
        await loadUI("checkout");
        const waitForCart = () => {
            if (document.getElementById("cart-items")) {
                window.loadCheckout();
            } else {
                requestAnimationFrame(waitForCart);
            }
        };
        waitForCart();

    } else if (route === "thankyou") {
        appDiv.innerHTML = `
            <div style="text-align:center;padding:6rem 1rem;">
                <h1>Thank You! 🎉</h1>
                <p>Your order has been placed successfully.</p>
                <p>We will call you soon to confirm.</p>
                <a href="#/home" data-link class="cta-button">Continue Shopping</a>
            </div>`;
        updateTitle("Thank You");
        window.scrollTo(0, 0);
        requestAnimationFrame(() => appDiv.style.opacity = "1");

    } else {
        location.hash = "#/home";
    }

    updateCartCounter();
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