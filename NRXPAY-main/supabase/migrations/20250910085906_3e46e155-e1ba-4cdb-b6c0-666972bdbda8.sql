-- Insert sample data for weekly rankings
INSERT INTO public.weekly_rankings (user_id, username, total_volume, total_transactions, rank_score, current_rank) VALUES
(gen_random_uuid(), 'Meera Joshi', 125000, 45, 125.50, 1),
(gen_random_uuid(), 'Arjun Singh', 89500, 38, 89.80, 2),
(gen_random_uuid(), 'Kiran Patel', 76200, 32, 76.40, 3),
(gen_random_uuid(), 'Ravi Kumar', 65800, 28, 65.90, 4),
(gen_random_uuid(), 'Neha Sharma', 58400, 25, 58.60, 5),
(gen_random_uuid(), 'Vikram Yadav', 52100, 22, 52.30, 6),
(gen_random_uuid(), 'Pooja Singh', 47600, 20, 47.80, 7),
(gen_random_uuid(), 'Manish Gupta', 43200, 18, 43.40, 8),
(gen_random_uuid(), 'Sonia Verma', 39800, 16, 39.90, 9),
(gen_random_uuid(), 'Deepak Jain', 36500, 15, 36.70, 10);

-- Insert sample data for daily rankings
INSERT INTO public.daily_rankings (user_id, username, total_volume, total_transactions, rank_score, current_rank) VALUES
(gen_random_uuid(), 'Arun Kumar', 45000, 15, 45.20, 1),
(gen_random_uuid(), 'Sunita Devi', 39500, 14, 39.70, 2),
(gen_random_uuid(), 'Rahul Sharma', 36200, 13, 36.40, 3),
(gen_random_uuid(), 'Geeta Singh', 32800, 12, 32.90, 4),
(gen_random_uuid(), 'Manoj Yadav', 28400, 11, 28.60, 5),
(gen_random_uuid(), 'Rekha Patel', 25100, 10, 25.30, 6),
(gen_random_uuid(), 'Sanjay Gupta', 22600, 9, 22.80, 7),
(gen_random_uuid(), 'Kavitha Rao', 19200, 8, 19.40, 8),
(gen_random_uuid(), 'Amit Joshi', 16800, 7, 17.00, 9),
(gen_random_uuid(), 'Priya Nair', 14500, 6, 14.70, 10);