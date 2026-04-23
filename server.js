/**
 * server.js – ENEB453 Lab 4
 * Express server with MySQL backend for ProWash Services
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Allow this app to be embedded in iframes (e.g. Adobe Portfolio)
app.use((_req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ── TODO 2.1: Activate API routes ─────────────────────────────
const customersRouter = require('./routes/customers');
const productsRouter  = require('./routes/products');
const ordersRouter    = require('./routes/orders');

app.use('/api/customers', customersRouter);
app.use('/api/products',  productsRouter);
app.use('/api/orders',    ordersRouter);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 fallback for unknown API routes ───────────────────────
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// ── Serve index.html for all non-API routes (SPA fallback) ────
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`ProWash API server running at http://localhost:${PORT}`);
});
