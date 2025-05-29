const SUPABASE_URL = "https://soxfqyzgbkbxpjkvxvvi.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveGZxeXpnYmtieHBqa3Z4dnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjQ1MTAsImV4cCI6MjA2Mzk0MDUxMH0.kxV61t2xqauvO-wYyUMIrmNUKow99kjG09JdGXjsO6c";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let MENU_ITEMS = [];
let cart = [];
let currentUser = null;

// Fetch Menu Items from Supabase
async function fetchMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("id", { ascending: true });
  if (error) {
    alert("Failed to load menu: " + (error.message || error));
    MENU_ITEMS = [];
  } else {
    MENU_ITEMS = data || [];
  }
  updateMenu();
}

// Menu Rendering
function updateMenu() {
  const menu = document.getElementById("menu");
  menu.innerHTML = "";
  if (MENU_ITEMS.length === 0) {
    menu.innerHTML =
      '<div style="text-align:center; grid-column: 1/-1; color: #bbb; font-size: 1.3rem;">No menu items available.</div>';
    return;
  }
  MENU_ITEMS.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
                        <img src="${item.img}" alt="${
      item.title
    }" data-preview="${item.img}" data-title="${item.title}">
                        <h3>${item.title}</h3>
                        <p>${item.desc}</p>
                        <div class="price">₵${Number(item.price).toFixed(
                          2
                        )}</div>
                        <button data-id="${item.id}">Add to Cart</button>
                    `;
    card
      .querySelector("button")
      .addEventListener("click", () => addToCart(item.id));
    // Enable preview on card image
    card.querySelector("img").addEventListener("click", (e) => {
      showImagePreview(item.img, item.title);
    });
    menu.appendChild(card);
  });
}

function addToCart(id) {
  const item = MENU_ITEMS.find((x) => x.id === id);
  if (!item) return;
  const existing = cart.find((x) => x.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  animateCart();
  updateCartCount();
}

function animateCart() {
  const cartBtn = document.getElementById("cart-btn");
  cartBtn.style.transform = "scale(1.15)";
  setTimeout(() => {
    cartBtn.style.transform = "";
  }, 200);
}

function updateCartCount() {
  document.getElementById("cart-count").innerText = cart.reduce(
    (sum, i) => sum + i.qty,
    0
  );
}

function openCart() {
  renderCart();
  document.getElementById("cart-modal").classList.add("active");
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("active");
}

function renderCart() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartList.innerHTML = `<li style="text-align:center; color:#bbb;">Cart is empty.</li>`;
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
                            <img src="${item.img}" alt="${
        item.title
      }" class="cart-img-thumb" data-preview="${item.img}" data-title="${
        item.title
      }" tabindex="0"/>
                            <div class="cart-item-details">
                              <span class="cart-item-title">${item.title}</span>
                              <div class="cart-item-qty-row">
                                <button class="cart-qty-btn" data-action="decrease" data-id="${
                                  item.id
                                }" aria-label="Decrease quantity">-</button>
                                <span class="cart-item-qty">${item.qty}</span>
                                <button class="cart-qty-btn" data-action="increase" data-id="${
                                  item.id
                                }" aria-label="Increase quantity">+</button>
                              </div>
                            </div>
                            <span class="cart-item-price">₵${(
                              item.price * item.qty
                            ).toFixed(2)}</span>
                            <button class="remove-btn" title="Remove" data-id="${
                              item.id
                            }">✕</button>
                        `;
      // Add click/keyboard preview for image
      li.querySelector(".cart-img-thumb").addEventListener("click", (e) =>
        showImagePreview(item.img, item.title)
      );
      li.querySelector(".cart-img-thumb").addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          showImagePreview(item.img, item.title);
        }
      });
      // Increase and decrease qty
      li.querySelector(
        '.cart-qty-btn[data-action="increase"]'
      ).addEventListener("click", () => {
        changeCartQty(item.id, 1);
      });
      li.querySelector(
        '.cart-qty-btn[data-action="decrease"]'
      ).addEventListener("click", () => {
        changeCartQty(item.id, -1);
      });
      // Remove
      li.querySelector(".remove-btn").addEventListener("click", () => {
        removeFromCart(item.id);
      });
      cartList.appendChild(li);
    });
  }
  updateCartTotal();
}

function changeCartQty(id, delta) {
  const item = cart.find((x) => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((x) => x.id !== id);
  }
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  cart = cart.filter((x) => x.id !== id);
  renderCart();
  updateCartCount();
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cart-total").innerText = `₵${total.toFixed(2)}`;
}

function showImagePreview(img, title) {
  document.getElementById("preview-img").src = img;
  document.getElementById("preview-title").innerText = title;
  document.getElementById("image-preview-modal").classList.add("active");
}

function closeImagePreview() {
  document.getElementById("image-preview-modal").classList.remove("active");
  document.getElementById("preview-img").src = "";
  document.getElementById("preview-title").innerText = "";
}

// Auth Modal Logic
function openAuthModal(defaultTab = "signin") {
  document.getElementById("auth-modal").classList.add("active");
  switchAuthTab(defaultTab);
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("active");
  clearAuthForms();
}

function switchAuthTab(tab) {
  document
    .getElementById("tab-signin")
    .classList.toggle("active", tab === "signin");
  document
    .getElementById("tab-signup")
    .classList.toggle("active", tab === "signup");
  document.getElementById("signin-form").style.display =
    tab === "signin" ? "block" : "none";
  document.getElementById("signup-form").style.display =
    tab === "signup" ? "block" : "none";
  document.getElementById("auth-title").innerText =
    tab === "signin" ? "Sign In" : "Sign Up";
}

function clearAuthForms() {
  document.getElementById("signin-email").value = "";
  document.getElementById("signin-password").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
  document.getElementById("signup-displayname").value = "";
  document.getElementById("signup-phone").value = "";
  document.getElementById("signup-location").value = "";
  document.getElementById("signin-error").innerText = "";
  document.getElementById("signup-error").innerText = "";
}
// ...existing code...
async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  document.getElementById("signin-error").innerText = "";
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    document.getElementById("signin-error").innerText = error.message;
  } else {
    currentUser = data.user;
    // Check if user has location in metadata, prompt if missing
    if (
      !currentUser.user_metadata ||
      !currentUser.user_metadata.location ||
      currentUser.user_metadata.location.trim() === ""
    ) {
      let location = "";
      while (!location) {
        location = prompt("Please add location (e.g. Hall, Hostel, Room):");
        if (location === null) break; // User cancelled
        location = location.trim();
      }
      if (location) {
        // Update user metadata
        const { data: updateData, error: updateError } =
          await supabase.auth.updateUser({
            data: {
              ...currentUser.user_metadata,
              location: location,
            },
          });
        if (!updateError && updateData && updateData.user) {
          currentUser = updateData.user;
        }
      }
    }
    updateAuthUserUI();
    closeAuthModal();
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const displayName = document.getElementById("signup-displayname").value;
  const phone = document.getElementById("signup-phone").value;
  const location = document.getElementById("signup-location").value;
  document.getElementById("signup-error").innerText = "";

  // Pass display name, phone, and location as user_metadata to Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone: phone,
        location: location,
      },
    },
  });
  if (error) {
    document.getElementById("signup-error").innerText = error.message;
  } else {
    currentUser = data.user;
    updateAuthUserUI();
    closeAuthModal();
  }
}

function updateAuthUserUI() {
  const userBox = document.getElementById("auth-user");
  if (currentUser && currentUser.email) {
    let name =
      currentUser.user_metadata && currentUser.user_metadata.display_name
        ? currentUser.user_metadata.display_name
        : currentUser.email;
    userBox.innerText = `Signed in as: ${name}`;
    document.getElementById("auth-btn").innerText = "Sign Out";
  } else {
    userBox.innerText = "";
    document.getElementById("auth-btn").innerText = "Sign In";
  }
}

async function handleAuthBtn() {
  if (currentUser) {
    // Sign out
    await supabase.auth.signOut();
    currentUser = null;
    updateAuthUserUI();
  } else {
    openAuthModal("signin");
  }
}

// Order Logic
async function handleOrder() {
  if (!currentUser) {
    openAuthModal("signin");
    return;
  }
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }
  // Save order to Supabase
  const { error } = await supabase.from("orders").insert([
    {
      email: currentUser.email,
      user_display_name:
        currentUser.user_metadata && currentUser.user_metadata.display_name
          ? currentUser.user_metadata.display_name
          : "",
      user_phone:
        currentUser.user_metadata && currentUser.user_metadata.phone
          ? currentUser.user_metadata.phone
          : "",
      user_location:
        currentUser.user_metadata && currentUser.user_metadata.location
          ? currentUser.user_metadata.location
          : "",
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
      })),
      total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    },
  ]);
  if (error) {
    alert("Failed to place order: " + error.message);
  } else {
    cart = [];
    updateCartCount();
    closeCart();
    showOrderConfirm();
  }
}

function showOrderConfirm() {
  document.getElementById("order-confirm").classList.add("active");
}

function closeOrderConfirm() {
  document.getElementById("order-confirm").classList.remove("active");
}

// Event Listeners
document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("auth-btn").addEventListener("click", handleAuthBtn);
document.getElementById("close-auth").addEventListener("click", closeAuthModal);
document
  .getElementById("close-confirm")
  .addEventListener("click", closeOrderConfirm);
document
  .getElementById("close-preview")
  .addEventListener("click", closeImagePreview);
document.getElementById("order-btn").addEventListener("click", handleOrder);

// Auth Tabs
document
  .getElementById("tab-signin")
  .addEventListener("click", () => switchAuthTab("signin"));
document
  .getElementById("tab-signup")
  .addEventListener("click", () => switchAuthTab("signup"));
document.getElementById("signin-form").addEventListener("submit", handleSignIn);
document.getElementById("signup-form").addEventListener("submit", handleSignUp);
document
  .getElementById("history-btn")
  .addEventListener("click", openOrderHistory);
document
  .getElementById("close-history")
  .addEventListener("click", closeOrderHistory);
// Optional: close on overlay click
document
  .getElementById("order-history-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeOrderHistory();
  });

// Close modals on overlay click
document
  .querySelectorAll(
    ".cart-modal, .order-confirm, .auth-modal, .image-preview-modal"
  )
  .forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
        if (modal === document.getElementById("image-preview-modal")) {
          closeImagePreview();
        }
      }
    });
  });

async function openOrderHistory() {
  if (!currentUser) {
    openAuthModal("signin");
    return;
  }
  document.getElementById("order-history-modal").classList.add("active");
  document.getElementById("order-history-list").innerHTML = "Loading...";
  // Fetch orders for current user
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("email", currentUser.email)
    .order("id", { ascending: false });
  if (error) {
    document.getElementById(
      "order-history-list"
    ).innerHTML = `<div style="color:#d32f2f;">Failed to load history: ${error.message}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    document.getElementById(
      "order-history-list"
    ).innerHTML = `<div style="color:#888;">No orders yet.</div>`;
    return;
  }
  document.getElementById("order-history-list").innerHTML = data
    .map((order) => {
      // Determine status label and color
      let status = "Pending";
      let color = "#ff9800";
      if (
        order.status &&
        (order.status.toLowerCase() === "delivered" || order.status === true)
      ) {
        status = "Delivered";
        color = "#43a047";
      }
      return `
      <div style="border-bottom:1px solid #eee;padding:10px 0;">
        <div style="font-weight:bold;">
          Order #${order.id} - ₵${Number(order.total).toFixed(2)}
          <span style="font-size:0.95em; margin-left:10px; color:${color}; font-weight:600;">
            ${status}
          </span>
        </div>
        <div style="font-size:0.97em;color:#888;">${new Date(
          order.created_at
        ).toLocaleString()}</div>
        <ul style="margin:6px 0 0 0;padding-left:18px;">
          ${order.items
            .map(
              (item) =>
                `<li>${item.qty} × ${
                  item.title
                } <span style="color:#888;">(₵${Number(item.price).toFixed(
                  2
                )})</span></li>`
            )
            .join("")}
        </ul>
      </div>
    `;
    })
    .join("");
}
function closeOrderHistory() {
  document.getElementById("order-history-modal").classList.remove("active");
}

// Supabase Auth state listener
supabase.auth.getUser().then(({ data: { user } }) => {
  currentUser = user;
  updateAuthUserUI();
});

// Initialize
fetchMenuItems();
updateCartCount();
