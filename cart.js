const CART_STORAGE_KEY = "stef_sewing_cart";

function getCart() {
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(sku, name, price, imageUrl) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.sku === sku);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ sku, name, price, imageUrl, quantity: 1 });
  }
  saveCart(cart);
  showToast(`Ajouté : ${name}`, price);
}

function removeFromCart(sku) {
  let cart = getCart();
  cart = cart.filter((item) => item.sku !== sku);
  saveCart(cart);
  if (window.location.pathname.includes("panier.html")) {
    renderCartPage();
  }
}

function updateCartQuantity(sku, delta) {
  const cart = getCart();
  const item = cart.find((item) => item.sku === sku);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    saveCart(cart);
    if (window.location.pathname.includes("panier.html")) {
      renderCartPage();
    }
  }
}

function updateCartUI() {
  const cart = getCart();
  const countElements = document.querySelectorAll("#cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  countElements.forEach((el) => {
    el.innerText = totalItems;
    el.classList.add("scale-125");
    setTimeout(() => el.classList.remove("scale-125"), 200);
  });

  const dropdownCount = document.getElementById("cart-dropdown-count");
  if (dropdownCount) {
    dropdownCount.innerText = `${totalItems} article${totalItems > 1 ? "s" : ""}`;
  }

  const dropdownItems = document.getElementById("cart-dropdown-items");
  const dropdownTotal = document.getElementById("cart-dropdown-total");

  if (dropdownItems && dropdownTotal) {
    if (cart.length === 0) {
      dropdownItems.innerHTML =
        '<p class="text-sm text-gray-500 text-center py-4">Votre panier est vide.</p>';
      dropdownTotal.innerText = "0.00€";
    } else {
      dropdownItems.innerHTML = cart
        .map(
          (item) => `
                <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                    <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold text-gray-800 truncate">${item.name}</h4>
                        <p class="text-xs text-gray-500">${item.quantity} x ${item.price.toFixed(2)}€</p>
                    </div>
                    <button onclick="removeFromCart('${item.sku}')" class="text-gray-400 hover:text-red-500 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `,
        )
        .join("");

      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      dropdownTotal.innerText = total.toFixed(2) + "€";
    }
  }
}

function showToast(message, price) {
  const toast = document.createElement("div");
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  toast.className =
    "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full shadow-2xl z-50 fade-in text-sm font-bold flex items-center gap-2";
  toast.innerHTML = `<span>🛍️ ${message}</span> <span class="bg-white text-gray-800 px-2 py-0.5 rounded-full text-xs">Total: ${total.toFixed(2)}€</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "all 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();

  const cartBtn = document.getElementById("cart-btn");
  const cartDropdown = document.getElementById("cart-dropdown");

  if (cartBtn && cartDropdown) {
    cartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cartDropdown.classList.toggle("hidden");
      cartDropdown.classList.add("fade-in");
    });

    document.addEventListener("click", (e) => {
      if (!cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) {
        cartDropdown.classList.add("hidden");
        cartDropdown.classList.remove("fade-in");
      }
    });
  }
});
