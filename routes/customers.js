/**
 * routes/customers.js
 * Full CRUD for the customers table.
 * Used as the reference implementation for products.js and orders.js.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/customers — list all customers (optional ?search=)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let sql    = 'SELECT * FROM customers ORDER BY created_at DESC';
        let params = [];

        if (search) {
            sql    = 'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC';
            params = [`%${search}%`, `%${search}%`];
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /customers error:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// GET /api/customers/:id — get a single customer
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /customers/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// POST /api/customers — create a new customer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'name and email are required' });
        }

        const [result] = await db.query(
            'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), phone || null]
        );

        res.status(201).json({ customer_id: result.insertId, name, email });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A customer with that email already exists' });
        }
        console.error('POST /customers error:', err);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// PUT /api/customers/:id — full update of a customer
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'name and email are required' });
        }

        const [result] = await db.query(
            'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name.trim(), email.trim().toLowerCase(), phone || null, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A customer with that email already exists' });
        }
        console.error('PUT /customers/:id error:', err);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// PATCH /api/customers/:id — partial update
router.patch('/:id', async (req, res) => {
    try {
        const fields  = [];
        const values  = [];

        if (req.body.name  !== undefined) { fields.push('name = ?');  values.push(req.body.name.trim()); }
        if (req.body.email !== undefined) { fields.push('email = ?'); values.push(req.body.email.trim().toLowerCase()); }
        if (req.body.phone !== undefined) { fields.push('phone = ?'); values.push(req.body.phone); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields provided to update' });

        values.push(req.params.id);
        const [result] = await db.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer patched successfully' });
    } catch (err) {
        console.error('PATCH /customers/:id error:', err);
        res.status(500).json({ error: 'Failed to patch customer' });
    }
});

// DELETE /api/customers/:id — delete a customer (cascades to orders)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        console.error('DELETE /customers/:id error:', err);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

module.exports = router;
