/**
 * routes/products.js
 * Full CRUD for the products table.
 * Modeled after routes/customers.js.
 *
 * Task 2.2: Implement every TODO stub below.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/products — list all products (optional ?search=)
router.get('/', async (req, res) => {
    // TODO 2.2a: query all products; if req.query.search is set,
    //            filter by name or category using LIKE.
    try {
        const { search } = req.query;
        let sql    = 'SELECT * FROM products ORDER BY created_at DESC';
        let params = [];

        if (search) {
            sql    = 'SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY created_at DESC';
            params = [`%${search}%`, `%${search}%`];
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /products error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id — get a single product
router.get('/:id', async (req, res) => {
    // TODO 2.2b: fetch one product by id; return 404 if not found.
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /products/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products — create a new product
router.post('/', async (req, res) => {
    // TODO 2.2c: validate required fields (name, price, category),
    //            insert into products, return 201 with new product_id.
    try {
        const { name, price, category, stock, description } = req.body;

        if (!name || price === undefined || !category) {
            return res.status(400).json({ error: 'name, price, and category are required' });
        }

        const [result] = await db.query(
            'INSERT INTO products (name, price, category, stock, description) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), parseFloat(price), category.trim(), parseInt(stock || 0, 10), description || null]
        );

        res.status(201).json({ product_id: result.insertId, name, price, category });
    } catch (err) {
        console.error('POST /products error:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id — full update of a product
router.put('/:id', async (req, res) => {
    // TODO 2.2d: validate name, price, category; update all columns; 404 if not found.
    try {
        const { name, price, category, stock, description } = req.body;

        if (!name || price === undefined || !category) {
            return res.status(400).json({ error: 'name, price, and category are required' });
        }

        const [result] = await db.query(
            'UPDATE products SET name = ?, price = ?, category = ?, stock = ?, description = ? WHERE id = ?',
            [name.trim(), parseFloat(price), category.trim(), parseInt(stock || 0, 10), description || null, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('PUT /products/:id error:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id — delete a product (cascades to orders)
router.delete('/:id', async (req, res) => {
    // TODO 2.2e: delete the product by id; 404 if not found.
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('DELETE /products/:id error:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
