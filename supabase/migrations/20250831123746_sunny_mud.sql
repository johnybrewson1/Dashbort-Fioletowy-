/*
  # Create webhook logs table

  1. New Tables
    - `webhook_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `webhook_source` (text) - make.com, zapier, etc.
      - `event_type` (text) - content_created, content_updated, etc.
      - `payload` (jsonb) - webhook payload
      - `response` (jsonb) - response data
      - `status` (text) - success, error, pending
      - `error_message` (text, nullable)
      - `processed_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `webhook_logs` table
    - Add policies for users to view their own webhook logs

  3. Indexes
    - Index on user_id for performance
    - Index on webhook_source for filtering
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_source text NOT NULL DEFAULT 'make.com',
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  response jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own webhook logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert webhook logs"
  ON webhook_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow system to insert logs

CREATE POLICY "System can update webhook logs"
  ON webhook_logs
  FOR UPDATE
  TO authenticated
  USING (true); -- Allow system to update logs

-- Create indexes
CREATE INDEX IF NOT EXISTS webhook_logs_user_id_idx ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS webhook_logs_source_idx ON webhook_logs(webhook_source);
CREATE INDEX IF NOT EXISTS webhook_logs_status_idx ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS webhook_logs_created_at_idx ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_logs_event_type_idx ON webhook_logs(event_type);