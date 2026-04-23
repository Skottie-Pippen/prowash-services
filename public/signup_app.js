/**
 * signup_app.js – Task 3.3
 * Wires the Signup page to the Express/MySQL backend via apiFetch().
 */

// ── DOM refs ─────────────────────────────────────────────────
const nameInput         = document.getElementById('name');
const emailInput        = document.getElementById('email');
const phoneInput        = document.getElementById('phone');
const btnSignup         = document.getElementById('btn-signup');
const signupMsg         = document.getElementById('signup-msg');
const btnLoadCustomers  = document.getElementById('btn-load-customers');
const customerTbody     = document.getElementById('customer-tbody');

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
    el.textContent = text;
    el.className   = `msg-box msg-${type}`;
}

function escapeHTML(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str ?? '')));
    return d.innerHTML;
}

// ── Task 3.3a: handleSignup ───────────────────────────────────
async function handleSignup() {
    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !email) {
        showMsg(signupMsg, 'Name and email are required.', 'error');
        return;
    }

    try {
        const result = await apiFetch('/api/customers', {
            method: 'POST',
            body:   JSON.stringify({ name, email, phone })
        });
        showMsg(signupMsg, `Account created! Your Customer ID is #${result.customer_id}. Welcome, ${escapeHTML(result.name)}!`);
        nameInput.value  = '';
        emailInput.value = '';
        phoneInput.value = '';
    } catch (err) {
        // Friendly message for duplicate email (409 Conflict)
        if (err.message.toLowerCase().includes('already exists')) {
            showMsg(signupMsg, 'That email is already registered. Please use a different email address.', 'error');
        } else {
            showMsg(signupMsg, 'Signup failed: ' + err.message, 'error');
        }
    }
}

// ── Task 3.3b: loadCustomers ──────────────────────────────────
async function loadCustomers() {
    try {
        const customers = await apiFetch('/api/customers');
        renderCustomers(customers);
    } catch (err) {
        customerTbody.innerHTML = `<tr><td colspan="6" style="color:#9b1d1d">Failed to load customers: ${escapeHTML(err.message)}</td></tr>`;
    }
}

// ── Render customers table ────────────────────────────────────
function renderCustomers(customers) {
    if (customers.length === 0) {
        customerTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted)">No customers yet.</td></tr>';
        return;
    }

    customerTbody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${escapeHTML(c.name)}</td>
            <td>${escapeHTML(c.email)}</td>
            <td>${escapeHTML(c.phone || '—')}</td>
            <td>${new Date(c.created_at).toLocaleDateString()}</td>
            <td>
                <button class="button-primary" style="font-size:0.8rem;padding:0.35rem 0.9rem"
                    onclick="deleteCustomer(${c.id}, '${escapeHTML(c.name)}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ── Task 3.3c: deleteCustomer ────────────────────────────────
async function deleteCustomer(id, name) {
    const confirmed = confirm(
        `Delete customer "${name}" (ID #${id})?\n\n` +
        'WARNING: This will also delete all orders associated with this customer (cascade delete).'
    );
    if (!confirmed) return;

    try {
        await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
        await loadCustomers();
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

// ── Event listeners ───────────────────────────────────────────
btnSignup.addEventListener('click', handleSignup);
btnLoadCustomers.addEventListener('click', loadCustomers);
