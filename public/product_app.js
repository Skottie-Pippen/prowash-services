/**
 * product_app.js – Task 3.1
 * Wires the Products page to the Express/MySQL backend via apiFetch().
 */

// ── State ────────────────────────────────────────────────────
let products  = [];
let editingId = null;

// ── DOM refs ─────────────────────────────────────────────────
const productList   = document.getElementById('product-list');
const btnSubmit     = document.getElementById('btn-submit');
const btnCancel     = document.getElementById('btn-cancel');
const btnSearch     = document.getElementById('btn-search');
const searchInput   = document.getElementById('search-input');
const formHeading   = document.getElementById('form-heading');
const toastEl       = document.getElementById('toast');

const nameInput     = document.getElementById('product-name');
const priceInput    = document.getElementById('product-price');
const categoryInput = document.getElementById('product-category');
const stockInput    = document.getElementById('product-stock');
const descInput     = document.getElementById('product-description');
const editIdInput   = document.getElementById('edit-id');

// ── Utility: fetch wrapper ────────────────────────────────────
async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast toast-${type} show`;
    setTimeout(() => { toastEl.classList.remove('show'); }, 2500);
}

// ── Escape HTML ───────────────────────────────────────────────
function escapeHTML(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str ?? '')));
    return d.innerHTML;
}

// ── Task 3.1a: loadProducts ───────────────────────────────────
async function loadProducts(search = '') {
    try {
        let url = '/api/products';
        if (search) url += `?search=${encodeURIComponent(search)}`;
        products = await apiFetch(url);
        renderProducts();
    } catch (err) {
        showToast('Failed to load products: ' + err.message, 'error');
    }
}

// ── Render ────────────────────────────────────────────────────
function renderProducts() {
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${escapeHTML(p.name)}</h3>
            <div class="product-meta">
                <span><strong>$${parseFloat(p.price).toFixed(2)}</strong></span>
                <span>Category: ${escapeHTML(p.category)}</span>
                <span>Stock: ${p.stock}</span>
            </div>
            <p class="description">${escapeHTML(p.description)}</p>
            <div class="product-meta" style="font-size:0.82rem">
                <span>ID: ${p.id}</span>
            </div>
            <div class="card-actions">
                <button class="btn-edit"   onclick="startEdit(${p.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        `;
        productList.appendChild(card);
    });
}

// ── Task 3.1b: handleProductSubmit ───────────────────────────
async function handleProductSubmit() {
    const body = {
        name:        nameInput.value.trim(),
        price:       parseFloat(priceInput.value),
        category:    categoryInput.value,
        stock:       parseInt(stockInput.value, 10),
        description: descInput.value.trim()
    };

    if (!body.name || !body.category || isNaN(body.price)) {
        showToast('Name, price, and category are required.', 'error');
        return;
    }

    try {
        if (editingId === null) {
            await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(body) });
            showToast('Product added successfully!');
        } else {
            await apiFetch(`/api/products/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Product updated successfully!');
        }
        exitEditMode();
        await loadProducts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ── Task 3.1c: deleteProduct ──────────────────────────────────
async function deleteProduct(id) {
    if (!confirm('Delete this product? Orders referencing it will also be deleted.')) return;
    try {
        await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted.');
        await loadProducts();
    } catch (err) {
        showToast('Delete failed: ' + err.message, 'error');
    }
}

// ── Edit helpers ──────────────────────────────────────────────
function startEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    nameInput.value     = p.name;
    priceInput.value    = p.price;
    categoryInput.value = p.category;
    stockInput.value    = p.stock;
    descInput.value     = p.description || '';
    editIdInput.value   = p.id;
    editingId = id;

    formHeading.textContent = `Edit: ${p.name}`;
    btnSubmit.textContent   = 'Save Changes';
    btnCancel.style.display = 'inline-block';
    nameInput.focus();
}

function exitEditMode() {
    editingId = null;
    ['product-name','product-price','product-category','product-stock','product-description','edit-id']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    formHeading.textContent = 'Add New Product';
    btnSubmit.textContent   = 'Add Product';
    btnCancel.style.display = 'none';
}

// ── Event listeners ───────────────────────────────────────────
btnSubmit.addEventListener('click', handleProductSubmit);
btnCancel.addEventListener('click', exitEditMode);
btnSearch.addEventListener('click', () => loadProducts(searchInput.value));
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') loadProducts(searchInput.value); });

// ── Init ──────────────────────────────────────────────────────
loadProducts();
