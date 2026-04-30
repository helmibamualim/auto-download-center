// Simple test endpoint without any dependencies
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    version: '1.0.1',
    note: 'Vercel native serverless function'
  });
}
