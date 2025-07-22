-- Fix event_id field to use text instead of UUID

-- First, drop the foreign key constraint
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_event_id_fkey;

-- Change the event_id column to text type
ALTER TABLE forms ALTER COLUMN event_id TYPE TEXT;

-- Update any existing records (if any)
UPDATE forms SET event_id = 'migrated-event-' || event_id WHERE event_id IS NOT NULL;