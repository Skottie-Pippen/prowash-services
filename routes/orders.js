/**
 * routes/orders.js
 * Full CRUD for the orders table with JOIN queries.
 *
 * Task 2.3: GET endpoints JOIN customers + products.
 *           POST retrieves product price before inserting.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── Shared JOIN query ──────────────────────────────────────────
const ORDER_SELECT = `
    SELECT
        o.id,
        o.quantity,
        o.total_price,
        o.status,
        o.created_at,
        c.id   AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        p.id   AS product_id,
        p.name AS product_name,
        p.price AS unit_price
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN products  p ON o.product_id  = p.id
`;

// GET /api/orders — list all orders with joined customer/product data
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(ORDER_SELECT + ' ORDER BY o.created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('GET /orders error:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id — get a single order with joined data
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(ORDER_SELECT + ' WHERE o.id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /orders/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// POST /api/orders — create a new order
// Retrieves the product price first, then calculates total_price.
router.post('/', async (req, res) => {
    try {
        const { customer_id, product_id, quantity } = req.body;

        if (!customer_id || !product_id || !quantity) {
            return res.status(400).json({ error: 'customer_id, product_id, and quantity are required' });
        }

        // Retrieve product price before inserting
        const [products] = await db.query('SELECT price FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) return res.status(404).json({ error: 'Product not found' });

        const unit_price  = parseFloat(products[0].price);
        const total_price = parseFloat((unit_price * parseInt(quantity, 10)).toFixed(2));

        const [result] = await db.query(
            'INSERT INTO orders (customer_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            [customer_id, product_id, parseInt(quantity, 10), total_price]
        );

        res.status(201).json({ order_id: result.insertId, total_price });
    } catch (err) {
        console.error('POST /orders error:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// PATCH /api/orders/:id/status — update only the order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
        }

        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order status updated', status });
    } catch (err) {
        console.error('PATCH /orders/:id/status error:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// DELETE /api/orders/:id — delete an order
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('DELETE /orders/:id error:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;
