-- Add event_identifier column to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS event_identifier TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_forms_event_identifier ON forms(event_identifier);

-- You can now delete the old event_id column if you want:
-- ALTER TABLE forms DROP COLUMN IF EXISTS event_id;