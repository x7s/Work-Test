// Глобални променливи
let allProducts = [];  // Тук ще държим всички продукти, заредени от сървъра

const productsGrid = document.getElementById('productsGrid');
const statsContainer = document.getElementById('statsContainer');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

// Зареждане на продуктите от сървъра (fetch към /products)
async function loadProducts() {
  try {
    const res = await fetch('/products');
    if (!res.ok) throw new Error(`Грешка при зареждане: ${res.statusText}`);

    allProducts = await res.json();

    renderProducts(allProducts);
    renderStats(allProducts);
  } catch (err) {
    console.error('Грешка при зареждане на продуктите:', err);
    productsGrid.innerHTML = `<p>Неуспешно зареждане на продуктите.</p>`;
  }
}

// Рендериране на продукти в grid
function renderProducts(products) {
  if (!products.length) {
    productsGrid.innerHTML = '<p>Няма намерени продукти.</p>';
    return;
  }

  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-meta">
          <div class="plu-badge">${product.plu}</div>
          <div class="product-group">${product.group}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Функция за преброяване на продукти по групи
function countProductsByGroup(products) {
  const counts = {};
  products.forEach(p => {
    counts[p.group] = (counts[p.group] || 0) + 1;
  });
  return counts;
}

// Рендериране на статистики за даден набор продукти
function renderStats(products) {
  const totalProducts = products.length;
  const groupCounts = countProductsByGroup(products);

  let html = `
    <div class="stat-card">
      <div class="stat-value">${totalProducts}</div>
      <div class="stat-label">Общо продукти</div>
    </div>
  `;

  const groups = [
    "Плодове",
    "Зеленчуци",
    "Печива сладки",
    "Печива солени",
    "Хлябове, багети, хлебчета"
  ];

  groups.forEach(group => {
    html += `
      <div class="stat-card">
        <div class="stat-value">${groupCounts[group] || 0}</div>
        <div class="stat-label">${group}</div>
      </div>
    `;
  });

  statsContainer.innerHTML = html;
}

// Филтриране по търсене
function filterProducts(searchTerm = '') {
  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.plu.includes(searchTerm)
  );
  renderProducts(filtered);
  renderStats(filtered);
}

// Филтриране по група
function filterProductsByGroup(group) {
  let filtered;
  if (group === 'all') {
    filtered = allProducts;
  } else {
    filtered = allProducts.filter(product => product.group === group);
  }
  renderProducts(filtered);
  renderStats(filtered);
}

// Слушатели на събития

// Търсене
if (searchInput) {
  searchInput.addEventListener('input', e => {
    // При търсене махаме активния филтър (бутон)
    filterButtons.forEach(btn => btn.classList.remove('active'));
    filterProducts(e.target.value);
  });
}

// Филтри по групи
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const group = button.dataset.group; // взема се от data-group атрибута
    filterProductsByGroup(group);

    // Изчистваме полето за търсене при филтриране по група
    if (searchInput) searchInput.value = '';
  });
});

// 🎯 Добавяне на нов продукт
document.getElementById('addButton').addEventListener('click', async () => {
  const name = document.getElementById('newName').value.trim();
  const plu = document.getElementById('newPlu').value.trim();
  const group = document.getElementById('newGroup').value;
  const imageInput = document.getElementById('newImage');
  const imageFile = imageInput.files[0];

  if (!name || !plu || !group || !imageFile) {
    showNotification('Моля, попълнете всички полета и изберете изображение.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('plu', plu);
  formData.append('group', group);
  formData.append('image', imageFile);

  try {
    const res = await fetch('/products', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      showNotification(err.error || 'Неуспешно добавяне на продукт.', 'error');
      return;
    }

    const newProduct = await res.json();

    // Презареждаме данните отново от сървъра (по-добре отколкото просто push)
    const updatedRes = await fetch('/products');
    const updatedProducts = await updatedRes.json();
    allProducts.length = 0;
    allProducts.push(...updatedProducts);

    renderProducts(allProducts);
    renderStats(allProducts);

    // Нулираме формата
    document.getElementById('newName').value = '';
    document.getElementById('newPlu').value = '';
    document.getElementById('newGroup').value = '';
    imageInput.value = '';

    showNotification('Продуктът е добавен успешно!');
  } catch (err) {
    console.error('Грешка при добавяне:', err);
    showNotification('Възникна грешка при заявката.', 'error');
  }
});

// 🔔 Функция за показване на известие
function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = 'notification'; // reset
  if (type === 'error') notif.classList.add('error');
  notif.style.display = 'block';

  setTimeout(() => {
    notif.style.display = 'none';
  }, 3000);
}

// Стартиране на зареждането на продукти при зареждане на страницата
loadProducts();