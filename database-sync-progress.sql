-- Create sync_progress table to track batch sync progress
CREATE TABLE IF NOT EXISTS sync_progress (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  current_batch INTEGER NOT NULL DEFAULT 0,
  total_processed INTEGER NOT NULL DEFAULT 0,
  total_inserted INTEGER NOT NULL DEFAULT 0,
  total_updated INTEGER NOT NULL DEFAULT 0,
  total_skipped INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  current_source TEXT NOT NULL DEFAULT 'github', -- github, fdroid
  last_query_index INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial record
INSERT INTO sync_progress (id, status, current_batch, total_processed, total_inserted, total_updated, total_skipped, total_failed, current_source, last_query_index)
VALUES (1, 'running', 0, 0, 0, 0, 0, 0, 'github', 0)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sync_progress_status ON sync_progress(status);
CREATE INDEX IF NOT EXISTS idx_sync_progress_updated_at ON sync_progress(updated_at);

-- Add comment
COMMENT ON TABLE sync_progress IS 'Tracks the progress of batch sync operations to prevent timeout and enable resumable syncs';
