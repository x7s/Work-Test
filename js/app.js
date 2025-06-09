// Вземаме DOM елементи
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const statsContainer = document.getElementById('statsContainer');
const filterButtons = document.querySelectorAll('.filter-btn');

function renderProducts(productsArray) {
    productsGrid.innerHTML = '';

    productsArray.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
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
        `;
        productsGrid.appendChild(card);
    });
}

function countProductsByGroup(productsArray) {
    return productsArray.reduce((acc, p) => {
        acc[p.group] = (acc[p.group] || 0) + 1;
        return acc;
    }, {});
}

function renderStats() {
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

function filterProducts(searchTerm = '') {
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.plu.includes(searchTerm)
    );
    renderProducts(filtered);
    renderStatsForFiltered(filtered);
}

function filterProductsByGroup(group) {
    const filtered = products.filter(product => product.group === group);
    renderProducts(filtered);
    renderStatsForFiltered(filtered);
}

function renderStatsForFiltered(filteredProducts) {
    const totalFiltered = filteredProducts.length;
    const groupCounts = countProductsByGroup(filteredProducts);

    let html = `
        <div class="stat-card">
            <div class="stat-value">${totalFiltered}</div>
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

// Слушатели на събития
searchInput.addEventListener('input', e => {
    filterProducts(e.target.value);
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const group = button.textContent;
        if(group === 'Всички продукти') {
            renderProducts(products);
            renderStats();
        } else {
            filterProductsByGroup(group);
        }
    });
});

// Инициализация при зареждане
renderProducts(products);
renderStats();

document.getElementById('addButton').addEventListener('click', addProduct);

function addProduct() {
  const img = document.getElementById('newImage').value.trim();
  const name = document.getElementById('newName').value.trim();
  const plu  = document.getElementById('newPlu').value.trim();
  const grp  = document.getElementById('newGroup').value;

  if (!img || !name || !plu) {
    alert('Попълни всички полета преди добавяне.');
    return;
  }

  products.push({ image: img, name, plu, group: grp });
  renderProducts(products);
  renderStats();
  // Изчистване на формата
  document.getElementById('newImage').value = '';
  document.getElementById('newName').value  = '';
  document.getElementById('newPlu').value   = '';
}