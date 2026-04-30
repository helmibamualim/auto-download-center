-- Create cron_logs table to track cron job executions
CREATE TABLE IF NOT EXISTS cron_logs (
  id BIGSERIAL PRIMARY KEY,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  endpoint TEXT NOT NULL DEFAULT '/api/sync-batch',
  status TEXT NOT NULL, -- 'success', 'failed', 'unauthorized'
  batch_number INTEGER,
  duration_ms INTEGER,
  processed INTEGER DEFAULT 0,
  inserted INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by TEXT DEFAULT 'cron', -- 'cron', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cron_logs_execution_time ON cron_logs(execution_time DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_triggered_by ON cron_logs(triggered_by);

-- Add comment
COMMENT ON TABLE cron_logs IS 'Logs all cron job executions for monitoring and debugging';

-- Sample query to check recent executions
-- SELECT * FROM cron_logs ORDER BY execution_time DESC LIMIT 10;
