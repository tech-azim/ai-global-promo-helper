-- ============================================
-- KOPI KITA CRM — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  favorite_drink TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROMO CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS promo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  segment_description TEXT,
  target_tags TEXT[] DEFAULT '{}',
  target_count INT DEFAULT 0,
  why_now TEXT,
  message TEXT,
  best_time TEXT,
  week_label TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vector search index
CREATE INDEX IF NOT EXISTS customers_embedding_idx 
ON customers USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Match customers function (for semantic search)
CREATE OR REPLACE FUNCTION match_customers(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.6,
  match_count INT DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  contact TEXT,
  favorite_drink TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    c.id, c.name, c.contact, c.favorite_drink, c.tags,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM customers c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ============================================
-- SEED DATA
-- ============================================


-- Seed customers (embedding will be generated via /api/seed endpoint)
INSERT INTO customers (name, contact, favorite_drink, tags) VALUES
('Sari Dewi',      '08111111101', 'Caramel Cold Brew',          ARRAY['sweet drinks', 'caramel', 'extra ice']),
('Budi Santoso',   '08111111102', 'Caramel Latte',              ARRAY['caramel', 'sweet drinks', 'latte']),
('Anita Wijaya',   NULL,          'Brown Sugar Oat Latte',      ARRAY['sweet drinks', 'oat milk', 'caramel']),
('Reza Pratama',   '08111111104', 'Gula Aren Latte',            ARRAY['sweet drinks', 'gula aren', 'latte']),
('Citra Lestari',  'citra@g.com', 'Vanilla Frappe',             ARRAY['sweet drinks', 'vanilla', 'cold']),
('Doni Kurniawan', '08111111106', 'Caramel Macchiato',          ARRAY['caramel', 'sweet drinks', 'milk']),
('Fika Amalia',    NULL,          'Taro Latte',                 ARRAY['sweet drinks', 'taro', 'oat milk']),
('Gilang Ramadan', '08111111108', 'Hazelnut Latte',             ARRAY['sweet drinks', 'hazelnut', 'latte']),
('Hana Putri',     'hana@g.com',  'Caramel Ribbon',             ARRAY['caramel', 'sweet drinks', 'extra ice']),
('Ivan Setiawan',  '08111111110', 'Milo Dinosaur',              ARRAY['sweet drinks', 'chocolate', 'extra ice']),
('Julia Susanto',  NULL,          'Brown Sugar Matcha',         ARRAY['sweet drinks', 'matcha', 'oat milk']),
('Kevin Hartono',  '08111111112', 'Double Caramel Latte',       ARRAY['caramel', 'sweet drinks', 'latte']),
('Lina Marlina',   '08222222201', 'Oat Milk Latte',             ARRAY['oat milk', 'less sugar', 'healthy']),
('Michael Tan',    'mike@g.com',  'Matcha Oat Latte',           ARRAY['oat milk', 'matcha', 'healthy']),
('Nadia Rahma',    '08222222203', 'Almond Milk Coffee',         ARRAY['non-dairy', 'less sugar', 'healthy']),
('Oscar Wijaya',   NULL,          'Cold Brew No Sugar',         ARRAY['less sugar', 'cold brew', 'healthy']),
('Putri Andini',   '08222222205', 'Green Tea Oat Latte',        ARRAY['oat milk', 'healthy', 'matcha']),
('Qadir Maulana',  'qadir@g.com', 'Oat Cappuccino',             ARRAY['oat milk', 'less sugar', 'cappuccino']),
('Rina Safitri',   '08222222207', 'Soy Milk Flat White',        ARRAY['non-dairy', 'healthy', 'flat white']),
('Sandi Nugroho',  NULL,          'Oat Milk Cortado',           ARRAY['oat milk', 'healthy', 'less sugar']),
('Tari Wulandari', '08222222209', 'Sparkling Cold Brew',        ARRAY['cold brew', 'less sugar', 'healthy']),
('Umar Farouk',    '08333333301', 'Latte + Croissant',          ARRAY['pastry lover', 'latte', 'morning']),
('Vera Kusuma',    'vera@g.com',  'Cappuccino + Danish',        ARRAY['pastry lover', 'cappuccino', 'morning']),
('Widi Astuti',    '08333333303', 'Flat White + Croissant',     ARRAY['pastry lover', 'flat white', 'morning']),
('Xena Pramesti',  NULL,          'Americano + Muffin',         ARRAY['pastry lover', 'americano', 'morning']),
('Yoga Pratama',   '08333333305', 'Latte + Banana Bread',       ARRAY['pastry lover', 'latte', 'morning']),
('Zahra Nisa',     'zahra@g.com', 'Matcha + Croissant',         ARRAY['pastry lover', 'matcha', 'morning']),
('Aldo Fernanda',  '08444444401', 'Manual Brew V60',            ARRAY['workshop', 'manual brew', 'single origin']),
('Bella Cahyani',  'bella@g.com', 'Latte Art Class',            ARRAY['workshop', 'latte art', 'cappuccino']),
('Chandra Putra',  '08444444403', 'Pour Over Ethiopia',         ARRAY['workshop', 'single origin', 'manual brew'])
ON CONFLICT DO NOTHING;