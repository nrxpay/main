-- Create mock users for the ranking data
INSERT INTO public.user_data (user_id, username, mobile_number) VALUES
(gen_random_uuid(), 'Rajesh Kumar', '+919876543201'),
(gen_random_uuid(), 'Priya Singh', '+919876543202'),
(gen_random_uuid(), 'Amit Sharma', '+919876543203'),
(gen_random_uuid(), 'Sneha Patel', '+919876543204'),
(gen_random_uuid(), 'Rohit Gupta', '+919876543205'),
(gen_random_uuid(), 'Anita Verma', '+919876543206'),
(gen_random_uuid(), 'Vikash Yadav', '+919876543207'),
(gen_random_uuid(), 'Deepika Rani', '+919876543208')
ON CONFLICT (user_id) DO NOTHING;

-- Create user_rankings entries with the data from the image
WITH user_mapping AS (
  SELECT 
    user_id,
    username,
    CASE username
      WHEN 'Rajesh Kumar' THEN 245000
      WHEN 'Priya Singh' THEN 198000
      WHEN 'Amit Sharma' THEN 167000
      WHEN 'Sneha Patel' THEN 145000
      WHEN 'Rohit Gupta' THEN 123000
      WHEN 'Anita Verma' THEN 112000
      WHEN 'Vikash Yadav' THEN 98500
      WHEN 'Deepika Rani' THEN 89200
    END as earnings,
    CASE username
      WHEN 'Rajesh Kumar' THEN 1
      WHEN 'Priya Singh' THEN 2
      WHEN 'Amit Sharma' THEN 3
      WHEN 'Sneha Patel' THEN 4
      WHEN 'Rohit Gupta' THEN 5
      WHEN 'Anita Verma' THEN 6
      WHEN 'Vikash Yadav' THEN 7
      WHEN 'Deepika Rani' THEN 8
    END as rank_position
  FROM public.user_data 
  WHERE username IN ('Rajesh Kumar', 'Priya Singh', 'Amit Sharma', 'Sneha Patel', 'Rohit Gupta', 'Anita Verma', 'Vikash Yadav', 'Deepika Rani')
)
INSERT INTO public.user_rankings (user_id, total_volume, total_transactions, rank_score, current_rank)
SELECT 
  user_id,
  earnings,
  FLOOR(RANDOM() * 50) + 10, -- Random transaction count between 10-60
  earnings, -- Use earnings as rank score
  rank_position
FROM user_mapping
ON CONFLICT (user_id) DO UPDATE SET
  total_volume = EXCLUDED.total_volume,
  rank_score = EXCLUDED.rank_score,
  current_rank = EXCLUDED.current_rank;