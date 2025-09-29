-- Add sample seafood products
-- Changed is_active to is_available to match database schema
INSERT INTO products (name, description, price, category, stock_quantity, image_url, is_available) VALUES
('Fresh Atlantic Salmon', 'Wild-caught Atlantic salmon, rich in omega-3 fatty acids. Perfect for grilling or baking.', 24.99, 'seafood', 50, '/placeholder.svg?height=400&width=400', true),
('Jumbo Shrimp', 'Large, succulent shrimp perfect for grilling, sautéing, or adding to pasta dishes.', 18.99, 'seafood', 75, '/placeholder.svg?height=400&width=400', true),
('Live Maine Lobster', 'Fresh Maine lobster, delivered live. The ultimate luxury seafood experience.', 39.99, 'seafood', 20, '/placeholder.svg?height=400&width=400', true),
('Yellowfin Tuna Steak', 'Sushi-grade yellowfin tuna, perfect for searing or enjoying raw.', 32.99, 'seafood', 30, '/placeholder.svg?height=400&width=400', true),
('Sea Scallops', 'Large, sweet sea scallops. Pan-sear for a restaurant-quality meal at home.', 28.99, 'seafood', 40, '/placeholder.svg?height=400&width=400', true),
('Fresh Oysters', 'Freshly shucked oysters from the Pacific Northwest. Served on the half shell.', 22.99, 'seafood', 60, '/placeholder.svg?height=400&width=400', true),
('King Crab Legs', 'Alaskan king crab legs, pre-cooked and ready to heat and serve.', 49.99, 'seafood', 25, '/placeholder.svg?height=400&width=400', true),
('Mahi Mahi Fillet', 'Mild, sweet white fish perfect for grilling or baking with tropical flavors.', 21.99, 'seafood', 35, '/placeholder.svg?height=400&width=400', true),
('Calamari Rings', 'Fresh calamari rings, perfect for frying or grilling.', 15.99, 'seafood', 45, '/placeholder.svg?height=400&width=400', true),
('Chilean Sea Bass', 'Premium Chilean sea bass with buttery texture and rich flavor.', 42.99, 'seafood', 15, '/placeholder.svg?height=400&width=400', true);

-- Add sample grocery products
INSERT INTO products (name, description, price, category, stock_quantity, image_url, is_available) VALUES
('Jasmine Rice (25lb)', 'Premium Thai jasmine rice with aromatic fragrance. Perfect for Asian cuisine.', 34.99, 'grocery', 100, '/placeholder.svg?height=400&width=400', true),
('Filipino Banana Ketchup', 'Sweet and tangy banana ketchup, a Filipino kitchen staple.', 4.99, 'grocery', 150, '/placeholder.svg?height=400&width=400', true),
('Coconut Milk', 'Rich, creamy coconut milk for curries, desserts, and beverages.', 3.49, 'grocery', 200, '/placeholder.svg?height=400&width=400', true),
('Fish Sauce', 'Authentic Vietnamese fish sauce for adding umami depth to dishes.', 5.99, 'grocery', 120, '/placeholder.svg?height=400&width=400', true),
('Dried Shiitake Mushrooms', 'Premium dried shiitake mushrooms for soups and stir-fries.', 12.99, 'grocery', 80, '/placeholder.svg?height=400&width=400', true),
('Soy Sauce (1L)', 'Traditional brewed soy sauce for marinades and dipping.', 6.99, 'grocery', 150, '/placeholder.svg?height=400&width=400', true),
('Rice Noodles', 'Thin rice noodles perfect for pho, pad thai, and spring rolls.', 4.49, 'grocery', 180, '/placeholder.svg?height=400&width=400', true),
('Tamarind Paste', 'Tangy tamarind paste for authentic Southeast Asian flavors.', 7.99, 'grocery', 90, '/placeholder.svg?height=400&width=400', true),
('Ube Halaya (Purple Yam Jam)', 'Sweet purple yam jam, perfect for desserts and pastries.', 8.99, 'grocery', 70, '/placeholder.svg?height=400&width=400', true),
('Calamansi Juice', 'Fresh calamansi juice concentrate for beverages and marinades.', 6.49, 'grocery', 110, '/placeholder.svg?height=400&width=400', true),
('Shrimp Paste', 'Fermented shrimp paste for authentic Filipino and Southeast Asian cooking.', 5.49, 'grocery', 95, '/placeholder.svg?height=400&width=400', true),
('Panko Breadcrumbs', 'Japanese-style breadcrumbs for extra crispy coating.', 4.99, 'grocery', 130, '/placeholder.svg?height=400&width=400', true);
