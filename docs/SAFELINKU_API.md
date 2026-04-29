# SafelinkU API Integration Guide

## Overview

SafelinkU API is used to create monetized shortlinks for all download URLs in the Auto Download Monetized Center. This allows you to earn revenue from advertisements shown before users reach the actual download.

## API Details

### Endpoint
```
POST https://safelinku.com/api/v1/links
```

### Headers
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "url": "https://example.com/download/file.zip",
  "alias": "custom-alias",
  "passcode": ""
}
```

### Parameters
- **url** (required): The original download URL to be shortened
- **alias** (optional): Custom alias for the shortlink
- **passcode** (optional): Password protection for the link

### Response Format

#### Success Response
```json
{
  "url": "https://safelinku.com/abc123"
}
```

#### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### HTTP Status Codes
- **201**: Link created successfully
- **400**: Invalid request body
- **401**: Unauthorized (invalid API token)
- **429**: Rate limit exceeded (60 requests per minute)

## Rate Limiting

SafelinkU API has a rate limit of **60 requests per minute** per API token.

Our implementation includes automatic rate limiting:
- Tracks request timestamps
- Automatically waits when limit is reached
- Adds 100ms buffer for safety

## Implementation

### Basic Usage
```typescript
import { createSafelinkUShortlink } from './safelinku';

const shortlink = await createSafelinkUShortlink(
  'https://example.com/download.zip',
  'my-app-download'
);
```

### With Rate Limiting (Recommended)
```typescript
import { createSafelinkUShortlinkWithRateLimit } from './safelinku';

const shortlink = await createSafelinkUShortlinkWithRateLimit(
  'https://example.com/download.zip',
  'my-app-download'
);
```

## Error Handling

The implementation handles various error scenarios:

1. **Missing API Token**: Returns null and logs error
2. **Network Errors**: Returns null and logs error
3. **API Errors**: Returns null and logs specific error code
4. **Rate Limiting**: Automatically waits and retries

## Best Practices

### 1. Use Rate Limited Function
Always use `createSafelinkUShortlinkWithRateLimit` for bulk operations to avoid hitting rate limits.

### 2. Handle Null Returns
Always check if the function returns null and have a fallback:

```typescript
const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(originalUrl, slug);

if (!safelinkUrl) {
  // Fallback: use original URL or show error
  console.error('Failed to create SafelinkU shortlink');
  return originalUrl; // or handle error appropriately
}
```

### 3. Store Results
Always store successful shortlinks in the database to avoid recreating them:

```typescript
// Check if shortlink already exists
if (app.safelinku_url) {
  return app.safelinku_url;
}

// Create new shortlink
const safelinkUrl = await createSafelinkUShortlinkWithRateLimit(app.original_download_url, app.slug);

if (safelinkUrl) {
  // Store in database
  await supabase
    .from('apps')
    .update({ safelinku_url: safelinkUrl })
    .eq('id', app.id);
}
```

### 4. Batch Processing
For bulk operations, process in batches to respect rate limits:

```typescript
const apps = await getAllAppsWithoutShortlinks();
const batchSize = 50; // Process 50 at a time

for (let i = 0; i < apps.length; i += batchSize) {
  const batch = apps.slice(i, i + batchSize);
  
  for (const app of batch) {
    const shortlink = await createSafelinkUShortlinkWithRateLimit(
      app.original_download_url,
      app.slug
    );
    
    if (shortlink) {
      await updateAppShortlink(app.id, shortlink);
    }
  }
  
  // Optional: Add delay between batches
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## Monitoring

### Success Rate
Monitor the success rate of shortlink creation:

```typescript
let successCount = 0;
let totalCount = 0;

for (const app of apps) {
  totalCount++;
  const shortlink = await createSafelinkUShortlinkWithRateLimit(app.url, app.slug);
  
  if (shortlink) {
    successCount++;
  }
}

console.log(`Success rate: ${(successCount / totalCount * 100).toFixed(2)}%`);
```

### Error Tracking
Log and track different types of errors:

```typescript
const errorStats = {
  networkErrors: 0,
  authErrors: 0,
  rateLimitErrors: 0,
  otherErrors: 0
};

// Update error stats based on response codes
```

## Revenue Optimization

### 1. Use Descriptive Aliases
Use meaningful aliases that describe the download:

```typescript
const alias = `${app.title.toLowerCase().replace(/\s+/g, '-')}-${app.platform.toLowerCase()}`;
const shortlink = await createSafelinkUShortlinkWithRateLimit(app.url, alias);
```

### 2. Track Performance
Monitor which types of downloads generate the most revenue through SafelinkU dashboard.

### 3. User Experience
Balance monetization with user experience:
- Ensure shortlinks work reliably
- Provide clear download instructions
- Have fallback options for failed shortlinks

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check API token is correct
   - Verify token hasn't expired
   - Ensure token has proper permissions

2. **429 Rate Limited**
   - Use rate limited function
   - Reduce request frequency
   - Implement exponential backoff

3. **400 Bad Request**
   - Verify URL format is correct
   - Check required fields are present
   - Validate URL is accessible

4. **Network Timeouts**
   - Implement retry logic
   - Increase timeout values
   - Check network connectivity

### Debug Mode
Enable debug logging for troubleshooting:

```typescript
// Add to environment variables
DEBUG_SAFELINKU=true

// In code
if (process.env.DEBUG_SAFELINKU) {
  console.log('SafelinkU request:', requestBody);
  console.log('SafelinkU response:', data);
}
```

## Security

### API Token Protection
- Never expose API token in client-side code
- Use environment variables
- Rotate tokens regularly
- Monitor token usage

### URL Validation
Always validate URLs before sending to SafelinkU:

```typescript
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('https://') || url.startsWith('http://');
  } catch {
    return false;
  }
}

if (!isValidUrl(originalUrl)) {
  console.error('Invalid URL:', originalUrl);
  return null;
}
```

## Support

For SafelinkU API issues:
- Check SafelinkU documentation
- Contact SafelinkU support
- Monitor SafelinkU status page
- Join SafelinkU community forums