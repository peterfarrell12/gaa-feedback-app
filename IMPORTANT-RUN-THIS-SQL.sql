-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- This adds the event_identifier column to the forms table

ALTER TABLE forms ADD COLUMN event_identifier TEXT;

-- Create an index for better performance
CREATE INDEX idx_forms_event_identifier ON forms(event_identifier);

-- Optional: If you want to remove the old event_id column (UUID), uncomment this:
-- ALTER TABLE forms DROP COLUMN event_id;