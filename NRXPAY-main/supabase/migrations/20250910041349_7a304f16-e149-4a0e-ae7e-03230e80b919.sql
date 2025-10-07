-- Add some sample Indian users to rankings if not exists
INSERT INTO user_rankings (user_id, total_volume, total_transactions, rank_score)
SELECT 
  user_data.user_id,
  FLOOR(RANDOM() * 500000 + 10000)::numeric AS total_volume,
  FLOOR(RANDOM() * 100 + 5)::integer AS total_transactions,
  FLOOR(RANDOM() * 1000 + 100)::numeric AS rank_score
FROM user_data 
WHERE user_data.user_id NOT IN (SELECT user_id FROM user_rankings)
LIMIT 10;

-- Update usernames with Indian names for better display
UPDATE user_rankings 
SET username = CASE 
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 0) THEN 'Rajesh Kumar'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 1) THEN 'Priya Sharma'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 2) THEN 'Arjun Singh'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 3) THEN 'Sneha Patel'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 4) THEN 'Vikash Gupta'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 5) THEN 'Anita Verma'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 6) THEN 'Rohit Joshi'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 7) THEN 'Meera Reddy'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 8) THEN 'Suresh Yadav'
  WHEN id = (SELECT id FROM user_rankings ORDER BY rank_score DESC LIMIT 1 OFFSET 9) THEN 'Kavita Das'
  ELSE username
END;