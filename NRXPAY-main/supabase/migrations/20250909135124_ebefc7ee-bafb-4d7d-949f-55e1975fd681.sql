-- Add a status update to trigger recharge popup for users
-- This will help track which users need to see recharge popup
ALTER TABLE savings_accounts ADD COLUMN show_recharge_popup BOOLEAN DEFAULT FALSE;
ALTER TABLE current_accounts ADD COLUMN show_recharge_popup BOOLEAN DEFAULT FALSE;
ALTER TABLE corporate_accounts ADD COLUMN show_recharge_popup BOOLEAN DEFAULT FALSE;