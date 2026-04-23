-- ============================================================
-- ENEB453 Lab 4 – Database Schema & Seed Data
-- Run this after connecting to the target database.
-- ============================================================

-- ── Drop tables in reverse FK order ──────────────────────────
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

-- ── customers ────────────────────────────────────────────────
CREATE TABLE customers (
    id         INT            NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100)   NOT NULL,
    email      VARCHAR(150)   NOT NULL UNIQUE,
    phone      VARCHAR(20),
    created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE products (
    id          INT             NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    price       DECIMAL(10,2)   NOT NULL,
    category    VARCHAR(50)     NOT NULL,
    stock       INT             NOT NULL DEFAULT 0,
    description TEXT,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE orders (
    id          INT           NOT NULL AUTO_INCREMENT,
    customer_id INT           NOT NULL,
    product_id  INT           NOT NULL,
    quantity    INT           NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status      ENUM('pending','confirmed','shipped','delivered','cancelled')
                              NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE
);

-- ============================================================
-- Seed Data
-- ============================================================

-- 5 customers
INSERT INTO customers (name, email, phone) VALUES
    ('Alice Johnson',  'alice@example.com',   '301-555-0101'),
    ('Bob Martinez',   'bob@example.com',     '240-555-0202'),
    ('Carol Williams', 'carol@example.com',   '410-555-0303'),
    ('David Kim',      'david@example.com',   '301-555-0404'),
    ('Eva Nguyen',     'eva@example.com',     '202-555-0505');

-- 3 products
INSERT INTO products (name, price, category, stock, description) VALUES
    ('Surface Cleaner Pro',  149.99, 'Equipment',         25,  'High-pressure rotary surface cleaner, 15-inch diameter, fits 3/8 in. inlet.'),
    ('Eco Degreaser 5L',      39.99, 'Cleaning Solution', 100, 'Biodegradable heavy-duty degreaser concentrate, dilutes 10:1.'),
    ('Extension Wand 24 in',  29.99, 'Accessory',          50, 'Stainless steel extension wand adds 24 inches of reach to any pressure washer.');

-- 5 orders
INSERT INTO orders (customer_id, product_id, quantity, total_price, status) VALUES
    (1, 1, 1,  149.99, 'confirmed'),
    (2, 2, 2,   79.98, 'shipped'),
    (3, 3, 3,   89.97, 'pending'),
    (4, 1, 1,  149.99, 'delivered'),
    (5, 2, 1,   39.99, 'pending');
