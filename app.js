/**
 * Breakfast Hub - Breakfast Ordering & Delivery Engine
 * Handles catalog rendering, item customization, cart state,
 * and checkout processing with direct order email delivery.
 */

// ==========================================
// 1. Menu Catalog Data
// ==========================================
const MENU_DATA = [
  {
    id: 'tea-milo',
    name: 'Tea (Milo) + Bread with Egg',
    category: 'tea',
    diet: 'sweet',
    isVeg: true,
    price: 25.00,
    image: 'assets/tea and bread.jpg',
    description: 'Hot Milo tea with bread and egg for a simple breakfast order that fills you up and keeps you going.',
    customizable: true,
    options: { toppings: [], sides: [] }
  },

  {
    id: 'tom-brown',
    name: 'Tom brown + Bread with egg',
    category: 'porridge',
    diet: 'sweet',
    isVeg: true,
    price: 25.00,
    image: 'assets/tom brown.jpg',
    description: 'Freshly prepared Tom Brown with bread and egg for a warm, nourishing weekday breakfast.',
    customizable: true,
    options: { toppings: [], sides: [] }
  },

  {
    id: 'oats',
    name: 'oats + bread with egg',
    category: 'porridge',
    diet: 'sweet',
    isVeg: true,
    price: 25.00,
    image: 'assets/Oatmeal.jpg',
    description: 'Wholesome oats, toasted bread, and a tasty egg designed for an easy breakfast delivery order.',
    customizable: true,
    options: { toppings: [], sides: [] }
  },

  {
    id: 'lipton',
    name: 'Lipton + Bread with eggs',
    category: 'tea',
    diet: 'sweet',
    isVeg: true,
    price: 20.00,
    image: 'assets/lipton.jpg',
    description: 'Classic Lipton tea with bread and eggs for a quick, satisfying delivery breakfast.',
    customizable: true,
    options: { toppings: [], sides: [] }
  }
];

// ==========================================
// 2. Application State
// ==========================================
const AppState = {
  activeCategory: 'all',
  activeDiet: 'all',
  searchQuery: '',
  cart: [],
  currentModalItem: null,
  modalQuantity: 1,
  activeOrder: null
};

// Change this email if you want orders sent somewhere else.
const ORDER_EMAIL_ADDRESS = 'nanaghentle679@gmail.com';

// ==========================================
// 3. Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedCart();
  renderCatalog();
  initEventListeners();
  updateCartUI();
  checkActiveOrder();
});

// ==========================================
// 4. Catalog Rendering & Filtering
// ==========================================
function renderCatalog() {
  const grid = document.getElementById('menu-grid');
  const countText = document.getElementById('menu-count-text');
  const titleText = document.getElementById('current-category-title');
  if (!grid) return;

  const query = AppState.searchQuery.toLowerCase().trim();

  const filtered = MENU_DATA.filter(item => {
    // Category check
    const matchesCategory = (AppState.activeCategory === 'all') || (item.category === AppState.activeCategory);
    // Diet check
    let matchesDiet = true;
    if (AppState.activeDiet === 'vegetarian') matchesDiet = item.isVeg;
    else if (AppState.activeDiet === 'protein') matchesDiet = (item.diet === 'protein' || !item.isVeg);
    else if (AppState.activeDiet === 'sweet') matchesDiet = (item.diet === 'sweet');
    else if (AppState.activeDiet === 'savory') matchesDiet = (item.diet === 'savory' || item.diet === 'protein');

    // Search query
    const matchesSearch = !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesDiet && matchesSearch;
  });

  if (countText) {
    countText.textContent = `Showing ${filtered.length} weekday breakfast combo${filtered.length === 1 ? '' : 's'}`;
  }

  grid.innerHTML = filtered.map(item => `
    <article class="food-card" data-id="${item.id}">
      <div class="card-media">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-header-line">
          <h3 class="food-title">${item.name}</h3>
        </div>
        <p class="food-desc">${item.description}</p>
        <div class="card-footer">
          <span class="food-price">GH₵${item.price.toFixed(0)}</span>
          <button class="btn-add-food" onclick="openCustomizer('${item.id}')" aria-label="Customize and add ${item.name}">
            <span>Order</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

window.resetFilters = function () {
  AppState.activeCategory = 'all';
  AppState.activeDiet = 'all';
  AppState.searchQuery = '';
  document.getElementById('menu-search-input').value = '';

  document.querySelectorAll('.category-chip').forEach(c => c.classList.toggle('active', c.dataset.category === 'all'));
  document.querySelectorAll('.dietary-chip').forEach(d => d.classList.toggle('active', d.dataset.diet === 'all'));
  renderCatalog();
};

// ==========================================
// 5. Customization Modal Logic
// ==========================================
window.openCustomizer = function (itemId) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  AppState.currentModalItem = item;
  AppState.modalQuantity = 1;

  document.getElementById('modal-item-image').src = item.image;
  document.getElementById('custom-modal-title').textContent = item.name;
  document.getElementById('custom-modal-desc').textContent = item.description;
  document.getElementById('modal-item-price').textContent = `GH₵${item.price.toFixed(0)}`;
  document.getElementById('modal-quantity-display').textContent = '1';
  document.getElementById('custom-item-notes').value = '';

  // Render dynamic options
  const optionsContainer = document.getElementById('modal-dynamic-options');
  let html = '';

  // Add-ons / sides (Checkboxes)
  const sidesList = item.options?.sides || item.options?.toppings || [];
  if (sidesList.length > 0) {
    html += `
      <div class="custom-option-group" style="margin-top: 14px;">
        <div class="option-group-title">
          <span>Morning Add-ons & Sides</span>
          <span class="tag">Optional</span>
        </div>
        <div class="options-pill-grid">
          ${sidesList.map(s => `
            <label class="choice-pill">
              <input type="checkbox" name="opt-addon" value="${s.name}" data-price="${s.price}">
              <span>${s.name}</span>
              <span class="extra-price">+${s.price === 0 ? s.price : '¢' + s.price.toFixed(2)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  optionsContainer.innerHTML = html;

  // Bind option listeners for visual state and price updates
  optionsContainer.querySelectorAll('.choice-pill input').forEach(input => {
    input.addEventListener('change', () => {
      if (input.type === 'radio') {
        const group = optionsContainer.querySelectorAll(`input[name="${input.name}"]`);
        group.forEach(r => r.closest('.choice-pill').classList.remove('selected'));
        input.closest('.choice-pill').classList.add('selected');
      } else if (input.type === 'checkbox') {
        input.closest('.choice-pill').classList.toggle('selected', input.checked);
      }
      calculateModalTotal();
    });
  });

  calculateModalTotal();
  document.getElementById('custom-modal-overlay').classList.add('open');
};

function calculateModalTotal() {
  if (!AppState.currentModalItem) return 0;
  let singleItemPrice = AppState.currentModalItem.price;

  // Add radio extras
  document.querySelectorAll('#modal-dynamic-options input[type="radio"]:checked').forEach(radio => {
    const extra = parseFloat(radio.dataset.price || 0);
    singleItemPrice += extra;
  });

  // Add checkbox extras
  document.querySelectorAll('#modal-dynamic-options input[type="checkbox"]:checked').forEach(box => {
    const extra = parseFloat(box.dataset.price || 0);
    singleItemPrice += extra;
  });

  const total = singleItemPrice * AppState.modalQuantity;
  document.getElementById('modal-calculated-total').textContent = `GH₵${total.toFixed(0)}`;
  return { singleItemPrice, total };
}

function closeCustomModal() {
  document.getElementById('custom-modal-overlay').classList.remove('open');
  AppState.currentModalItem = null;
}

// ==========================================
// 6. Cart Management & Storage
// ==========================================
function loadSavedCart() {
  try {
    const saved = localStorage.getItem('sunrise_plate_cart');
    if (saved) {
      AppState.cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading cart:', e);
    AppState.cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('sunrise_plate_cart', JSON.stringify(AppState.cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

function addItemToCartFromModal() {
  if (!AppState.currentModalItem) return;

  const item = AppState.currentModalItem;
  const { singleItemPrice } = calculateModalTotal();

  // Gather chosen options
  const selectedOptions = [];
  document.querySelectorAll('#modal-dynamic-options input:checked').forEach(input => {
    selectedOptions.push(input.value);
  });

  const notes = document.getElementById('custom-item-notes').value.trim();

  // Cart item object
  const cartItem = {
    cartItemId: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    id: item.id,
    name: item.name,
    image: item.image,
    unitPrice: singleItemPrice,
    quantity: AppState.modalQuantity,
    options: selectedOptions,
    notes: notes
  };

  AppState.cart.push(cartItem);
  saveCart();
  updateCartUI();
  closeCustomModal();
  openCartDrawer();
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('header-cart-count');
  const mobilePill = document.getElementById('floating-mobile-cart');
  const mobileCount = document.getElementById('mobile-cart-count');
  const mobileTotal = document.getElementById('mobile-cart-total');
  const footerSection = document.getElementById('cart-footer-section');

  const totalItemCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = totalItemCount;

  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const grandTotal = subtotal;

  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-grand-total');
  if (subtotalEl) subtotalEl.textContent = `GH₵${subtotal.toFixed(0)}`;
  if (totalEl) totalEl.textContent = `GH₵${grandTotal.toFixed(0)}`;

  if (mobilePill && mobileCount && mobileTotal) {
    if (totalItemCount > 0) {
      mobilePill.style.display = 'flex';
      mobileCount.textContent = `${totalItemCount} item${totalItemCount === 1 ? '' : 's'}`;
      mobileTotal.textContent = `GH₵${grandTotal.toFixed(0)}`;
    } else {
      mobilePill.style.display = 'none';
    }
  }

  // Render items list inside drawer
  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🥞</div>
        <h3>Your Morning Bag is Empty</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 6px 0 16px;">
          Add warm buttermilk stacks, eggs benedict, or cold brew to start your order!
        </p>
        <button class="btn-primary" onclick="closeCartDrawer(); location.href='#menu-catalog'">
          Browse Breakfast Menu
        </button>   
      </div>
    `;
    if (footerSection) footerSection.style.display = 'none';
    return;
  }

  if (footerSection) footerSection.style.display = 'flex';

  container.innerHTML = AppState.cart.map(item => `
    <div class="cart-item-card" data-cart-id="${item.cartItemId}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-header">
          <span class="cart-item-title">${item.name}</span>
          <span class="cart-item-price">GH₵${(item.unitPrice * item.quantity).toFixed(0)}</span>
        </div>
        
        <div class="cart-item-customizations">
          ${item.options.length > 0 ? item.options.join(' • ') : 'Standard Chef Prep'}
          ${item.notes ? `<div style="font-style: italic; color: #78716C;">Note: "${item.notes}"</div>` : ''}
        </div>

        <div class="cart-item-controls">
          <div class="cart-stepper">
            <button class="btn-cart-step" onclick="changeCartItemQty('${item.cartItemId}', -1)">−</button>
            <span style="font-weight: 700; font-size: 0.85rem; min-width: 16px; text-align: center;">${item.quantity}</span>
            <button class="btn-cart-step" onclick="changeCartItemQty('${item.cartItemId}', 1)">+</button>
          </div>
          <button class="btn-remove-item" onclick="removeCartItem('${item.cartItemId}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.changeCartItemQty = function (cartItemId, delta) {
  const item = AppState.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    AppState.cart = AppState.cart.filter(i => i.cartItemId !== cartItemId);
  }
  saveCart();
  updateCartUI();
};

window.removeCartItem = function (cartItemId) {
  AppState.cart = AppState.cart.filter(i => i.cartItemId !== cartItemId);
  saveCart();
  updateCartUI();
};

function openCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('open');
}

// ==========================================
// 7. Checkout & Live Order Simulation
// ==========================================
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    alert('Please add breakfast items to your bag first.');
    return;
  }
  closeCartDrawer();
  document.getElementById('checkout-modal-overlay').classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal-overlay').classList.remove('open');
}

function formatOrderEmailBody(order, customerDetails) {
  const formattedItems = order.items.map(item => {
    const optionsText = item.options && item.options.length ? ` (${item.options.join(', ')})` : '';
    const noteText = item.notes ? ` — Note: ${item.notes}` : '';
    return `- ${item.quantity}x ${item.name}${optionsText}${noteText}`;
  }).join('\n');

  return [
    'New Breakfast Hub order received.',
    '',
    `Order ID: ${order.id}`,
    `Customer: ${customerDetails.name}`,
    `Phone: ${customerDetails.phone}`,
    `Delivery address: ${customerDetails.street}`,
    `Total: GH₵${order.total.toFixed(0)}`,
    '',
    'Order items:',
    formattedItems,
    '',
    'Please confirm delivery and prepare the breakfast order.'
  ].join('\n');
}

async function sendOrderByEmail(order, customerDetails) {
  const payload = {
    _subject: `New Breakfast Hub Order #${order.id}`,
    _captcha: 'false',
    customer: customerDetails.name,
    phone: customerDetails.phone,
    address: customerDetails.street,
    total: `GH₵${order.total.toFixed(0)}`,
    items: order.items.map(item => `${item.quantity}x ${item.name}${item.notes ? ` (${item.notes})` : ''}`).join('\n'),
    message: formatOrderEmailBody(order, customerDetails)
  };

  const response = await fetch(`https://formsubmit.co/ajax/${ORDER_EMAIL_ADDRESS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Order email could not be sent.');
  }

  return response.json();
}

async function submitBreakfastOrder() {
  const street = document.getElementById('checkout-street').value.trim();
  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();

  if (!street || !name || !phone) {
    alert('Please complete your delivery address, name, and phone number.');
    return;
  }

  const subtotal = AppState.cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const total = Math.max(0, subtotal);
  const orderNum = 'SP-' + Math.floor(1000 + Math.random() * 9000);

  const order = {
    id: orderNum,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: [...AppState.cart],
    total: total,
    address: street,
    customer: name,
    phone: phone,
    stage: 1
  };

  const customerDetails = { name, phone, street };

  try {
    AppState.activeOrder = order;
    saveActiveOrder(order);
    await sendOrderByEmail(order, customerDetails);

    AppState.cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    openOrderSuccessModal();
  } catch (error) {
    console.error(error);
    alert('Your order details could not be sent right now. Please try again or contact the business directly.');
  }
}

function openOrderSuccessModal() {
  document.getElementById('email-success-overlay')?.classList.add('open');
}

function closeOrderSuccessModal() {
  document.getElementById('email-success-overlay')?.classList.remove('open');
}

function saveActiveOrder(order) {
  try {
    localStorage.setItem('sunrise_active_order', JSON.stringify(order));
  } catch (e) {
    console.error(e);
  }
}

function checkActiveOrder() {
  try {
    const saved = localStorage.getItem('sunrise_active_order');
    if (saved) {
      AppState.activeOrder = JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// 9. Event Listeners Setup
// ==========================================
function initEventListeners() {
  // Search bar
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Category filter chips
  document.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeCategory = btn.dataset.category;
      renderCatalog();
    });
  });

  // Dietary filter chips
  document.querySelectorAll('.dietary-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dietary-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeDiet = btn.dataset.diet;
      renderCatalog();
    });
  });

  // Cart open / close
  document.getElementById('btn-open-cart')?.addEventListener('click', openCartDrawer);
  document.getElementById('btn-close-cart')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'cart-drawer-overlay') closeCartDrawer();
  });

  // Mobile cart pill
  document.getElementById('btn-mobile-view-cart')?.addEventListener('click', openCartDrawer);

  // Customizer modal buttons
  document.getElementById('btn-close-custom-modal')?.addEventListener('click', closeCustomModal);
  document.getElementById('custom-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'custom-modal-overlay') closeCustomModal();
  });

  document.getElementById('btn-modal-minus')?.addEventListener('click', () => {
    if (AppState.modalQuantity > 1) {
      AppState.modalQuantity--;
      document.getElementById('modal-quantity-display').textContent = AppState.modalQuantity;
      calculateModalTotal();
    }
  });

  document.getElementById('btn-modal-plus')?.addEventListener('click', () => {
    AppState.modalQuantity++;
    document.getElementById('modal-quantity-display').textContent = AppState.modalQuantity;
    calculateModalTotal();
  });

  document.getElementById('btn-confirm-add-cart')?.addEventListener('click', addItemToCartFromModal);

  // Checkout flow
  document.getElementById('btn-open-checkout')?.addEventListener('click', openCheckoutModal);
  document.getElementById('btn-close-checkout')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('btn-back-to-cart')?.addEventListener('click', () => {
    closeCheckoutModal();
    openCartDrawer();
  });
  document.getElementById('btn-submit-order')?.addEventListener('click', submitBreakfastOrder);

  // Checkout delivery timing toggle
  document.querySelectorAll('.time-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.time-choice-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Checkout payment method toggle
  document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isCard = tab.dataset.pay === 'card';
      document.getElementById('card-fields').style.display = isCard ? 'grid' : 'none';
    });
  });

  document.getElementById('btn-close-success-modal')?.addEventListener('click', closeOrderSuccessModal);
  document.getElementById('email-success-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'email-success-overlay') closeOrderSuccessModal();
  });

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('site-header');
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
}