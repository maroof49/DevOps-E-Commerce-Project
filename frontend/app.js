async function loadProducts() {
    const container = document.getElementById("products");
    try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const products = await response.json();

        container.innerHTML = products.map(product => `
          <article class="card">
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <strong>₹${Number(product.price).toLocaleString("en-IN")}</strong>
            <button onclick="addToCart('${escapeHtml(product.name)}')">Add to Cart</button>
          </article>
        `).join("");
    } catch (error) {
        container.textContent = `Could not load products: ${error.message}`;
    }
}

function addToCart(name) {
    alert(`${name} added to cart`);
}

function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
}

loadProducts();
