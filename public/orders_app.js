/**
 * orders_app.js – Task 3.2
 * Wires the Orders page to the Express/MySQL backend via apiFetch().
 */

// ── DOM refs ─────────────────────────────────────────────────
const ordersTbody      = document.getElementById('orders-tbody');
const btnLoadOrders    = document.getElementById('btn-load-orders');
const btnOrderSubmit   = document.getElementById('btn-order-submit');
const orderCustomerIn  = document.getElementById('order-customer');
const orderProductIn   = document.getElementById('order-product');
const orderQtyIn       = document.getElementById('order-qty');
const orderMsg         = document.getElementById('order-msg');

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

function showMsg(el, text, type = 'success') {
    el.textContent  = text;
    el.className    = `msg-box msg-${type}`;
}

function escapeHTML(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str ?? '')));
    return d.innerHTML;
}

// ── Status badge CSS class ────────────────────────────────────
function statusClass(status) {
    return `status-pill status-${status}`;
}

// ── Task 3.2a: loadOrders ─────────────────────────────────────
async function loadOrders() {
    try {
        const orders = await apiFetch('/api/orders');
        renderOrders(orders);
    } catch (err) {
        ordersTbody.innerHTML = `<tr><td colspan="7" style="color:#9b1d1d">Failed to load orders: ${escapeHTML(err.message)}</td></tr>`;
    }
}

// ── Render orders table ───────────────────────────────────────
function renderOrders(orders) {
    if (orders.length === 0) {
        ordersTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted)">No orders found.</td></tr>';
        return;
    }

    ordersTbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${escapeHTML(o.customer_name)} <small style="color:var(--muted)">(#${o.customer_id})</small></td>
            <td>${escapeHTML(o.product_name)} <small style="color:var(--muted)">(#${o.product_id})</small></td>
            <td>${o.quantity}</td>
            <td>$${parseFloat(o.total_price).toFixed(2)}</td>
            <td><span class="${statusClass(o.status)}">${escapeHTML(o.status)}</span></td>
            <td>
                <select class="status-select" data-id="${o.id}" style="font-size:0.8rem;padding:0.3rem 0.5rem;border-radius:8px;border:1px solid var(--line)">
                    <option value="">Update status…</option>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                </select>
                <button class="btn-del-order" onclick="deleteOrder(${o.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    // Attach change listeners to status dropdowns
    document.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', () => {
            if (sel.value) updateOrderStatus(parseInt(sel.dataset.id, 10), sel.value);
        });
    });
}

// ── Task 3.2b: handleOrderSubmit ─────────────────────────────
async function handleOrderSubmit() {
    const customer_id = parseInt(orderCustomerIn.value, 10);
    const product_id  = parseInt(orderProductIn.value, 10);
    const quantity    = parseInt(orderQtyIn.value, 10);

    if (!customer_id || !product_id || !quantity || quantity < 1) {
        showMsg(orderMsg, 'Customer ID, Product ID, and Quantity are required.', 'error');
        return;
    }

    try {
        const result = await apiFetch('/api/orders', {
            method: 'POST',
            body:   JSON.stringify({ customer_id, product_id, quantity })
        });
        showMsg(orderMsg, `Order #${result.order_id} placed! Total: $${parseFloat(result.total_price).toFixed(2)}`);
        orderCustomerIn.value = '';
        orderProductIn.value  = '';
        orderQtyIn.value      = '1';
        await loadOrders();
    } catch (err) {
        showMsg(orderMsg, 'Failed to place order: ' + err.message, 'error');
    }
}

// ── Task 3.2c: updateOrderStatus ─────────────────────────────
async function updateOrderStatus(id, status) {
    try {
        await apiFetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            body:   JSON.stringify({ status })
        });
        await loadOrders();
    } catch (err) {
        alert('Status update failed: ' + err.message);
    }
}

// ── Task 3.2d: deleteOrder ────────────────────────────────────
async function deleteOrder(id) {
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;
    try {
        await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
        await loadOrders();
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

// ── Event listeners ───────────────────────────────────────────
btnLoadOrders.addEventListener('click', loadOrders);
btnOrderSubmit.addEventListener('click', handleOrderSubmit);

// ── Init ──────────────────────────────────────────────────────
loadOrders();
