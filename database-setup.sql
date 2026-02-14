-- MassDwell Finish Selection Portal Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  adu_model VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  access_token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'locked')),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create finish_categories table
CREATE TABLE finish_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create finish_options table
CREATE TABLE finish_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  category_id UUID REFERENCES finish_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price_upgrade DECIMAL(10,2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create project_selections table
CREATE TABLE project_selections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finish_categories(id) ON DELETE CASCADE,
  option_id UUID REFERENCES finish_options(id) ON DELETE CASCADE,
  UNIQUE(project_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_access_token ON projects(access_token);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_finish_categories_active ON finish_categories(is_active, display_order);
CREATE INDEX idx_finish_options_category ON finish_options(category_id, is_active, display_order);
CREATE INDEX idx_project_selections_project ON project_selections(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finish_categories_updated_at BEFORE UPDATE ON finish_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finish_options_updated_at BEFORE UPDATE ON finish_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_selections_updated_at BEFORE UPDATE ON project_selections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample finish categories
INSERT INTO finish_categories (name, display_name, description, display_order) VALUES
  ('flooring', 'Flooring', 'Choose your flooring material for all living areas', 1),
  ('kitchen_cabinets', 'Kitchen Cabinets', 'Select cabinet color and style for your kitchen', 2),
  ('countertops', 'Countertops', 'Choose countertop material and color', 3),
  ('bathroom_fixtures', 'Bathroom Fixtures', 'Select bathroom fixtures and finishes', 4),
  ('paint_colors', 'Paint Colors', 'Choose interior paint colors for walls and trim', 5),
  ('hardware', 'Hardware', 'Select door handles, cabinet knobs, and other hardware', 6),
  ('appliances', 'Appliances', 'Choose your appliance package (if applicable)', 7);

-- Insert sample finish options for Flooring
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'flooring'), 'Standard LVP - Oak', 'Luxury Vinyl Plank in natural oak finish', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'flooring'), 'Premium LVP - Walnut', 'High-end Luxury Vinyl Plank in rich walnut', 1500, 2),
  ((SELECT id FROM finish_categories WHERE name = 'flooring'), 'Ceramic Tile - Neutral', 'Large format ceramic tile in neutral tones', 2000, 3),
  ((SELECT id FROM finish_categories WHERE name = 'flooring'), 'Hardwood - Red Oak', 'Solid red oak hardwood flooring', 3500, 4);

-- Insert sample finish options for Kitchen Cabinets
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'kitchen_cabinets'), 'Standard White Shaker', 'Classic white shaker style cabinets', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'kitchen_cabinets'), 'Gray Shaker', 'Modern gray shaker style cabinets', 800, 2),
  ((SELECT id FROM finish_categories WHERE name = 'kitchen_cabinets'), 'Natural Wood', 'Natural wood finish with soft close hardware', 1200, 3),
  ((SELECT id FROM finish_categories WHERE name = 'kitchen_cabinets'), 'Navy Blue Shaker', 'Bold navy blue shaker style cabinets', 1000, 4);

-- Insert sample finish options for Countertops
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'countertops'), 'Standard Laminate', 'Durable laminate in neutral pattern', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'countertops'), 'Quartz - White', 'Engineered quartz in classic white', 1800, 2),
  ((SELECT id FROM finish_categories WHERE name = 'countertops'), 'Quartz - Gray Marble Look', 'Quartz with marble veining pattern', 2200, 3),
  ((SELECT id FROM finish_categories WHERE name = 'countertops'), 'Granite - Natural', 'Natural granite stone countertops', 1500, 4);

-- Insert sample finish options for Bathroom Fixtures
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'bathroom_fixtures'), 'Standard Chrome Package', 'Chrome faucets, showerhead, and accessories', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'bathroom_fixtures'), 'Brushed Nickel Package', 'Brushed nickel finish throughout', 300, 2),
  ((SELECT id FROM finish_categories WHERE name = 'bathroom_fixtures'), 'Matte Black Package', 'Modern matte black fixtures', 500, 3),
  ((SELECT id FROM finish_categories WHERE name = 'bathroom_fixtures'), 'Premium Brass Package', 'Antique brass finish with premium hardware', 800, 4);

-- Insert sample finish options for Paint Colors
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'paint_colors'), 'Standard Neutral Package', 'Warm white walls with white trim', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'paint_colors'), 'Modern Gray Package', 'Light gray walls with crisp white trim', 200, 2),
  ((SELECT id FROM finish_categories WHERE name = 'paint_colors'), 'Warm Beige Package', 'Warm beige walls with cream trim', 200, 3),
  ((SELECT id FROM finish_categories WHERE name = 'paint_colors'), 'Custom Color Package', 'Choose any paint colors (consultation included)', 500, 4);

-- Insert sample finish options for Hardware
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'hardware'), 'Standard Chrome Hardware', 'Chrome door handles and cabinet knobs', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'hardware'), 'Brushed Nickel Hardware', 'Brushed nickel throughout', 150, 2),
  ((SELECT id FROM finish_categories WHERE name = 'hardware'), 'Matte Black Hardware', 'Modern matte black hardware package', 200, 3),
  ((SELECT id FROM finish_categories WHERE name = 'hardware'), 'Premium Brass Hardware', 'Antique brass finish hardware', 300, 4);

-- Insert sample finish options for Appliances
INSERT INTO finish_options (category_id, name, description, price_upgrade, display_order) VALUES
  ((SELECT id FROM finish_categories WHERE name = 'appliances'), 'Not Applicable', 'Client will provide their own appliances', 0, 1),
  ((SELECT id FROM finish_categories WHERE name = 'appliances'), 'Basic Appliance Package', 'Standard white appliances (fridge, range, dishwasher)', 2500, 2),
  ((SELECT id FROM finish_categories WHERE name = 'appliances'), 'Stainless Steel Package', 'Energy efficient stainless steel appliances', 3500, 3),
  ((SELECT id FROM finish_categories WHERE name = 'appliances'), 'Premium Package', 'High-end stainless steel with smart features', 5000, 4);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finish_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finish_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since we're using token-based auth)
-- These policies allow read access to all users (for the customer portal)
CREATE POLICY "Allow public read access to finish_categories" ON finish_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to finish_options" ON finish_options FOR SELECT USING (true);

-- For projects, allow read access but only with valid token (handled in app logic)
CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to project_selections" ON project_selections FOR SELECT USING (true);

-- Allow public insert/update for project selections (customers making selections)
CREATE POLICY "Allow public insert to project_selections" ON project_selections FOR INSERT USING (true);
CREATE POLICY "Allow public update to project_selections" ON project_selections FOR UPDATE USING (true);

-- Allow public update to projects (for status changes)
CREATE POLICY "Allow public update to projects" ON projects FOR UPDATE USING (true);

-- For admin functions, you might want to create more restrictive policies later
-- For now, allowing public access since we handle auth in the application layer