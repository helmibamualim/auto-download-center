-- Auto Download Monetized Center Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create the main apps table
CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  version TEXT NOT NULL,
  license TEXT,
  developer TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  original_download_url TEXT NOT NULL,
  safelinku_url TEXT,
  icon_url TEXT,
  screenshot_url TEXT,
  file_type TEXT NOT NULL,
  file_size TEXT,
  stars INTEGER,
  downloads_count INTEGER DEFAULT 0,
  changelog TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_platform ON apps(platform);
CREATE INDEX IF NOT EXISTS idx_apps_source_url ON apps(source_url);
CREATE INDEX IF NOT EXISTS idx_apps_original_download_url ON apps(original_download_url);
CREATE INDEX IF NOT EXISTS idx_apps_is_active ON apps(is_active);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_updated_at ON apps(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_stars ON apps(stars DESC);
CREATE INDEX IF NOT EXISTS idx_apps_title ON apps(title);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_apps_active_category ON apps(is_active, category);
CREATE INDEX IF NOT EXISTS idx_apps_active_platform ON apps(is_active, platform);
CREATE INDEX IF NOT EXISTS idx_apps_active_created ON apps(is_active, created_at DESC);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_apps_search ON apps USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(developer, '')));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_apps_updated_at ON apps;
CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON apps
    FOR SELECT USING (is_active = true);

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access" ON apps
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample categories (optional)
-- These will be populated automatically by the sync process
COMMENT ON TABLE apps IS 'Main table storing all indexed applications and software';
COMMENT ON COLUMN apps.slug IS 'URL-friendly unique identifier for the app';
COMMENT ON COLUMN apps.source_name IS 'Source platform: GitHub, F-Droid, SourceForge';
COMMENT ON COLUMN apps.original_download_url IS 'Direct download URL from the original source';
COMMENT ON COLUMN apps.safelinku_url IS 'Monetized shortlink URL from SafelinkU';
COMMENT ON COLUMN apps.is_active IS 'Whether the app is currently active and should be displayed';
COMMENT ON COLUMN apps.last_synced_at IS 'Last time this app was updated by the sync process';

-- Create a view for public app data (optional, for better security)
CREATE OR REPLACE VIEW public_apps AS
SELECT 
    id,
    title,
    slug,
    description,
    short_description,
    category,
    platform,
    version,
    license,
    developer,
    source_name,
    source_url,
    icon_url,
    screenshot_url,
    file_type,
    file_size,
    stars,
    downloads_count,
    changelog,
    created_at,
    updated_at
FROM apps 
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public_apps TO anon, authenticated;

-- Create function to get app statistics
CREATE OR REPLACE FUNCTION get_app_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_apps', COUNT(*),
        'active_apps', COUNT(*) FILTER (WHERE is_active = true),
        'categories', COUNT(DISTINCT category),
        'platforms', COUNT(DISTINCT platform),
        'sources', COUNT(DISTINCT source_name),
        'last_updated', MAX(updated_at)
    ) INTO result
    FROM apps;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search apps
CREATE OR REPLACE FUNCTION search_apps(search_query TEXT, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    short_description TEXT,
    category TEXT,
    platform TEXT,
    version TEXT,
    license TEXT,
    developer TEXT,
    source_name TEXT,
    source_url TEXT,
    icon_url TEXT,
    screenshot_url TEXT,
    file_type TEXT,
    file_size TEXT,
    stars INTEGER,
    downloads_count INTEGER,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.description,
        a.short_description,
        a.category,
        a.platform,
        a.version,
        a.license,
        a.developer,
        a.source_name,
        a.source_url,
        a.icon_url,
        a.screenshot_url,
        a.file_type,
        a.file_size,
        a.stars,
        a.downloads_count,
        a.changelog,
        a.created_at,
        a.updated_at,
        ts_rank(to_tsvector('english', a.title || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.developer, '')), plainto_tsquery('english', search_query)) as rank
    FROM apps a
    WHERE 
        a.is_active = true
        AND (
            a.title ILIKE '%' || search_query || '%'
            OR a.description ILIKE '%' || search_query || '%'
            OR a.developer ILIKE '%' || search_query || '%'
            OR a.category ILIKE '%' || search_query || '%'
            OR to_tsvector('english', a.title || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.developer, '')) @@ plainto_tsquery('english', search_query)
        )
    ORDER BY rank DESC, a.stars DESC NULLS LAST, a.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_app_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_apps(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'You can now run the sync scripts to populate the database.';
END $$;