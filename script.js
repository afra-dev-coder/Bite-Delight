// ===== MENU FILTER FUNCTION =====
function filterMenu(category) {
  const allCards = Array.from(document.querySelectorAll('.products .card'));
  const container = document.querySelector('.products');

  if (category === "All") {
    // Separate drinks and others
    const drinks = allCards.filter(c => c.getAttribute('data-category') === 'Drinks');
    const others = allCards.filter(c => c.getAttribute('data-category') !== 'Drinks');

    // Shuffle others
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    // Append in new order (others first, drinks last - or as requested "drinks ko hta kr sb irregular hojae")
    // I'll show others randomized, then drinks.
    container.innerHTML = "";
    others.forEach(c => {
      c.style.display = "block";
      container.appendChild(c);
    });
    drinks.forEach(c => {
      c.style.display = "block";
      container.appendChild(c);
    });
  } else {
    // Show only specific category in original order? 
    // The "original order" is tricky if we've already shuffled the DOM.
    // Let's sort them by their internal content or just re-fetch if we had a master list.
    // Simpler: Just hide/show and rely on the last "All" order, OR just sort by text.
    // User said: "jb specific aik category me jaun to phr sequence se srf usi ki cheze do"
    // To restore sequence, I'll sort by a hidden index or just title.

    allCards.forEach(card => {
      if (card.getAttribute('data-category') === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });

    // Sort visible cards by title to give a "sequence" feel
    const visible = allCards.filter(c => c.style.display === "block");
    visible.sort((a, b) => a.querySelector('h3').innerText.localeCompare(b.querySelector('h3').innerText));
    visible.forEach(c => container.appendChild(c));
  }

  // Adjust margins
  const visibleCards = allCards.filter(c => c.style.display === "block");
  visibleCards.forEach((card, index) => {
    card.style.marginRight = (index % 3 === 2) ? "0" : "1%";
  });

  // Update active button state
  const btns = document.querySelectorAll('.category-buttons button');
  btns.forEach(btn => {
    if (btn.innerText.includes(category)) {
      btn.classList.add('active-cat');
    } else {
      btn.classList.remove('active-cat');
    }
  });
}

// ===== TOGGLE SEARCH =====
function toggleSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput.classList.contains("show-search")) {
    searchInput.classList.remove("show-search");
    searchInput.value = ""; // clear when close
    filterMenu("All"); // reset view
  } else {
    searchInput.classList.add("show-search");
    searchInput.focus();
  }
}

// ===== SEARCH MENU =====
function searchMenu() {
  const input = document.getElementById("searchInput").value.toUpperCase();
  const allCards = document.querySelectorAll('.products .card');

  allCards.forEach(card => {
    const title = card.querySelector("h3").innerText.toUpperCase();
    if (title.indexOf(input) > -1) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Re-adjust margins for visible cards
  const visibleCards = Array.from(allCards).filter(c => c.style.display === "block");
  visibleCards.forEach((card, index) => {
    card.style.marginRight = (index % 3 === 2) ? "0" : "1%";
  });
}

// ===== ADD TO CART =====
let cart = [];

// Load cart from localStorage if exists
if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'));
}

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  displayCart();
}

// ===== UPDATE CART BADGE =====
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    badge.innerText = count;
  }
}

// ===== UPDATE QUANTITY =====
function updateQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty += delta;
    if (item.qty < 1) {
      removeFromCart(name);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      displayCart();
    }
  }
}

// ===== DISPLAY CART =====
function displayCart() {
  const cartContainer = document.getElementById("cartItems");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p style='color:white; text-align:center;'>Your cart is empty</p>";
    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerText = "Total: Rs 0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-row";
    div.innerHTML = `
      <div class="cart-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">Rs ${item.price}</span>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" onclick="updateQty('${item.name}', -1)">-</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.name}', 1)">+</button>
      </div>
      <div class="cart-total-item">Rs ${item.price * item.qty}</div>
      <button class="trash-btn" onclick="removeFromCart('${item.name}')">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartContainer.appendChild(div);
  });

  const totalEl = document.getElementById("total");
  if (totalEl) totalEl.innerText = `Total: Rs ${total}`;
}

// ===== REMOVE FROM CART =====
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  displayCart();
}

// ===== CHECKOUT =====
function checkout() {
  if (cart.length === 0) {
    return;
  }
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "index.html"; // Redirect to home
  updateCartBadge();
}

// ===== INIT =====
window.onload = () => {
  // If we are on menu page, filter all
  if (document.querySelector('.products')) {
    filterMenu("All");
  }
  updateCartBadge();
  displayCart();

  // Initialize slider if on menu page
  if (document.querySelector('.menu-hero-slider')) {
    initSlider();
    setupCategoryHighlighting();
  }


};




// ===== HERO SLIDER FUNCTIONALITY =====
let currentSlideIndex = 0;
let slideInterval;

function initSlider() {
  showSlide(currentSlideIndex);
  startAutoSlide();

  // Pause on hover
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }
}

function showSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  if (index >= slides.length) currentSlideIndex = 0;
  if (index < 0) currentSlideIndex = slides.length - 1;

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  slides[currentSlideIndex].classList.add('active');
  dots[currentSlideIndex].classList.add('active');
}

function changeSlide(direction) {
  currentSlideIndex += direction;
  showSlide(currentSlideIndex);
  resetAutoSlide();
}

function currentSlide(index) {
  currentSlideIndex = index;
  showSlide(currentSlideIndex);
  resetAutoSlide();
}

function startAutoSlide() {
  slideInterval = setInterval(() => {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
  }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// ===== CATEGORY HIGHLIGHTING ON SCROLL =====
function setupCategoryHighlighting() {
  const categoryButtons = document.querySelectorAll('.category-buttons button');
  const productCards = document.querySelectorAll('.products .card');

  // Add click event to maintain active state
  categoryButtons.forEach(button => {
    button.addEventListener('click', function () {
      categoryButtons.forEach(btn => btn.classList.remove('active-cat'));
      this.classList.add('active-cat');
    });
  });

  // Scroll detection for category highlighting
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    let activeCategory = 'All';
    productCards.forEach(card => {
      const cardTop = card.offsetTop;
      const cardBottom = cardTop + card.offsetHeight;

      if (scrollPosition >= cardTop && scrollPosition <= cardBottom) {
        if (card.style.display !== 'none') {
          activeCategory = card.getAttribute('data-category');
        }
      }
    });

    // Update active button based on scroll
    if (activeCategory !== 'All') {
      categoryButtons.forEach(btn => {
        if (btn.innerText.includes(activeCategory)) {
          btn.classList.add('active-cat');
        } else {
          btn.classList.remove('active-cat');
        }
      });
    }
  });
}
