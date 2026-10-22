-- Create Sports Spots Table in Supabase
CREATE TABLE IF NOT EXISTS sports_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT NOT NULL,
    is_free BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    address TEXT NOT NULL,
    distance TEXT,
    price_per_hr NUMERIC(10,2) DEFAULT 0,
    has_rental BOOLEAN DEFAULT FALSE,
    has_tickets BOOLEAN DEFAULT FALSE,
    rental_price NUMERIC(10,2) DEFAULT 0,
    ticket_price NUMERIC(10,2) DEFAULT 0,
    image_url TEXT NOT NULL,
    description TEXT,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6)
);

ALTER TABLE sports_spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public spots viewable" ON sports_spots FOR SELECT USING (true);
CREATE POLICY "Public spots insertable" ON sports_spots FOR INSERT WITH CHECK (true);

-- Insert Initial Spots
INSERT INTO sports_spots (title, city, category, is_free, rating, reviews_count, address, distance, price_per_hr, has_rental, has_tickets, rental_price, ticket_price, image_url, description, lat, lng) VALUES
('City Park Free Streetball Courts', 'Skopje', 'courts', true, 4.8, 142, 'Gradski Park, Skopje', '0.8 km', 0, false, false, 0, 0, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80', 'Full-size outdoor basketball courts with night lights. Free entry 24/7.', 41.9986, 21.4209),
('Vardar Riverside Workout Gym', 'Skopje', 'calisthenics', true, 4.7, 98, 'Vardar Quay, Skopje', '1.2 km', 0, false, false, 0, 0, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', 'Outdoor calisthenics & gymnastics workout park.', 41.9962, 21.4321),
('Vodno MTB Downhill Trail', 'Skopje', 'cycling', true, 4.9, 210, 'Sredno Vodno, Skopje', '4.5 km', 0, true, false, 15, 0, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', 'MTB forest trail with bike rental station.', 41.9764, 21.3902),
('Lake Ohrid Beach Volleyball Hub', 'Ohrid', 'beach', true, 4.9, 185, 'Kaneo Beach, Ohrid', '0.5 km', 0, true, false, 12, 0, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80', 'Lake beach courts with volleyball nets & SUP rentals.', 41.1122, 20.7948);
