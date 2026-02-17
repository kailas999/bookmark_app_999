-- ============================================
-- Advanced Features Database Schema
-- ============================================
-- This extends the base schema with:
-- 1. Tags System
-- 2. Metadata fields
-- 3. Full-Text Search
-- 4. Analytics views
-- ============================================

-- ============================================
-- 1. TAGS SYSTEM
-- ============================================

-- Create bookmark_tags table for many-to-many relationship
CREATE TABLE IF NOT EXISTS bookmark_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bookmark_id, tag)
);

-- Indexes for tag queries
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag ON bookmark_tags(tag);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_created_at ON bookmark_tags(created_at);

-- Enable RLS on bookmark_tags
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmark_tags
CREATE POLICY "Users can view their own bookmark tags"
  ON bookmark_tags FOR SELECT
  USING (
    bookmark_id IN (
      SELECT id FROM bookmarks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tags for their bookmarks"
  ON bookmark_tags FOR INSERT
  WITH CHECK (
    bookmark_id IN (
      SELECT id FROM bookmarks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own bookmark tags"
  ON bookmark_tags FOR DELETE
  USING (
    bookmark_id IN (
      SELECT id FROM bookmarks WHERE user_id = auth.uid()
    )
  );

-- Enable realtime for bookmark_tags
ALTER PUBLICATION supabase_realtime ADD TABLE bookmark_tags;

-- ============================================
-- 2. METADATA FIELDS
-- ============================================

-- Add metadata columns to bookmarks table
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS domain TEXT;

-- Index for domain queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_domain ON bookmarks(domain);

-- ============================================
-- 3. FULL-TEXT SEARCH
-- ============================================

-- Add search vector column
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_bookmarks_search ON bookmarks USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION bookmarks_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.url, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.domain, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
DROP TRIGGER IF EXISTS bookmarks_search_trigger ON bookmarks;
CREATE TRIGGER bookmarks_search_trigger
  BEFORE INSERT OR UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION bookmarks_search_update();

-- Update existing bookmarks with search vectors
UPDATE bookmarks SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(url, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(domain, '')), 'D')
WHERE search_vector IS NULL;

-- ============================================
-- 4. ANALYTICS VIEWS
-- ============================================

-- Daily bookmark stats
CREATE OR REPLACE VIEW bookmark_stats_daily AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count,
  user_id
FROM bookmarks
GROUP BY DATE(created_at), user_id;

-- Collection stats with bookmark counts
CREATE OR REPLACE VIEW collection_stats AS
SELECT 
  c.id,
  c.name,
  c.color,
  c.user_id,
  COUNT(b.id) as bookmark_count,
  MAX(b.created_at) as last_bookmark_added
FROM collections c
LEFT JOIN bookmarks b ON b.collection = c.id::text
GROUP BY c.id, c.name, c.color, c.user_id;

-- Tag usage stats
CREATE OR REPLACE VIEW tag_stats AS
SELECT 
  bt.tag,
  COUNT(*) as usage_count,
  b.user_id,
  MAX(bt.created_at) as last_used
FROM bookmark_tags bt
JOIN bookmarks b ON b.id = bt.bookmark_id
GROUP BY bt.tag, b.user_id;

-- Domain stats (top saved domains)
CREATE OR REPLACE VIEW domain_stats AS
SELECT 
  domain,
  COUNT(*) as bookmark_count,
  user_id,
  MAX(created_at) as last_saved
FROM bookmarks
WHERE domain IS NOT NULL
GROUP BY domain, user_id
ORDER BY bookmark_count DESC;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get popular tags for autocomplete
CREATE OR REPLACE FUNCTION get_popular_tags(user_uuid UUID, search_term TEXT DEFAULT '', limit_count INT DEFAULT 10)
RETURNS TABLE(tag TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.tag,
    COUNT(*) as count
  FROM bookmark_tags bt
  JOIN bookmarks b ON b.id = bt.bookmark_id
  WHERE b.user_id = user_uuid
    AND (search_term = '' OR bt.tag ILIKE search_term || '%')
  GROUP BY bt.tag
  ORDER BY count DESC, bt.tag ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_bookmarks(
  user_uuid UUID,
  search_query TEXT,
  limit_count INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  url TEXT,
  description TEXT,
  thumbnail_url TEXT,
  favicon TEXT,
  collection TEXT,
  is_favorite BOOLEAN,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.url,
    b.description,
    b.thumbnail_url,
    b.favicon,
    b.collection,
    b.is_favorite,
    b.created_at,
    ts_rank(b.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM bookmarks b
  WHERE b.user_id = user_uuid
    AND b.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, b.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETE!
-- ============================================
-- Run this SQL in Supabase SQL Editor to add all advanced features
