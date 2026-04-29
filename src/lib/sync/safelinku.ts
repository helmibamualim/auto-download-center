interface SafelinkUResponse {
  url?: string;
  shortlink?: string;
  short_url?: string;
  link?: string;
  data?: {
    url?: string;
    shortlink?: string;
    short_url?: string;
  };
  error?: string;
  message?: string;
  success?: boolean;
}

export async function createSafelinkUShortlink(originalUrl: string, alias?: string, retryCount: number = 0): Promise<string | null> {
  const apiToken = import.meta.env.SAFELINKU_API_TOKEN;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  
  console.log('='.repeat(80));
  console.log('[SafelinkU DEBUG] Starting SafelinkU API call (Attempt ' + (retryCount + 1) + '/' + (MAX_RETRIES + 1) + ')');
  console.log('='.repeat(80));
  
  // Check if token exists
  if (!apiToken) {
    console.error('[SafelinkU DEBUG] ❌ SAFELINKU_API_TOKEN is undefined or empty');
    console.error('[SafelinkU DEBUG] Environment check:');
    console.error('[SafelinkU DEBUG] - Token exists:', !!apiToken);
    console.error('[SafelinkU DEBUG] - Token type:', typeof apiToken);
    return null;
  }
  
  console.log('[SafelinkU DEBUG] ✅ API Token found');
  console.log('[SafelinkU DEBUG] - Token length:', apiToken.length);
  console.log('[SafelinkU DEBUG] - Token prefix:', apiToken.substring(0, 10) + '...');

  console.log('[SafelinkU DEBUG] Request parameters:');
  console.log('[SafelinkU DEBUG] - Original URL:', originalUrl);
  console.log('[SafelinkU DEBUG] - Alias:', alias || '(empty string)');

  try {
    const requestBody = {
      url: originalUrl,
      alias: alias || '',
      passcode: ''
    };

    // Enhanced headers to bypass Cloudflare
    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Origin': 'https://auto-download-center.vercel.app',
      'Referer': 'https://auto-download-center.vercel.app/',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    };

    console.log('[SafelinkU DEBUG] Request details:');
    console.log('[SafelinkU DEBUG] - Method: POST');
    console.log('[SafelinkU DEBUG] - Endpoint: https://safelinku.com/api/v1/links');
    console.log('[SafelinkU DEBUG] - Headers:');
    Object.keys(headers).forEach(key => {
      if (key === 'Authorization') {
        console.log(`[SafelinkU DEBUG]   * ${key}: Bearer ${apiToken.substring(0, 10)}...`);
      } else {
        console.log(`[SafelinkU DEBUG]   * ${key}: ${headers[key as keyof typeof headers]}`);
      }
    });
    console.log('[SafelinkU DEBUG] - Body:', JSON.stringify(requestBody, null, 2));

    console.log('[SafelinkU DEBUG] Sending request...');
    const startTime = Date.now();
    
    const response = await fetch('https://safelinku.com/api/v1/links', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    const duration = Date.now() - startTime;
    console.log('[SafelinkU DEBUG] Response received in', duration, 'ms');
    console.log('[SafelinkU DEBUG] Response status:', response.status, response.statusText);
    console.log('[SafelinkU DEBUG] Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`[SafelinkU DEBUG]   * ${key}: ${value}`);
    });

    // Read response body
    const responseText = await response.text();
    console.log('[SafelinkU DEBUG] Raw response body (first 500 chars):');
    console.log('[SafelinkU DEBUG]', responseText.substring(0, 500));
    
    // Check if response is HTML (Cloudflare challenge)
    const isHtmlResponse = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');
    if (isHtmlResponse) {
      console.error('[SafelinkU DEBUG] ❌ Received HTML response (likely Cloudflare challenge)');
      console.error('[SafelinkU DEBUG] Response contains:', 
        responseText.includes('Just a moment') ? 'Cloudflare challenge page' : 'Unknown HTML page'
      );
      
      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`[SafelinkU DEBUG] ⏳ Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return createSafelinkUShortlink(originalUrl, alias, retryCount + 1);
      } else {
        console.error('[SafelinkU DEBUG] ❌ Max retries exceeded. Cloudflare is blocking all requests.');
        return null;
      }
    }

    // SafelinkU API returns 201 for successful link creation
    if (response.status !== 201 && !response.ok) {
      console.error('[SafelinkU DEBUG] ❌ API returned error status');
      console.error('[SafelinkU DEBUG] Status code:', response.status);
      console.error('[SafelinkU DEBUG] Status text:', response.statusText);
      console.error('[SafelinkU DEBUG] Response body:', responseText);
      
      // Handle specific error codes
      switch (response.status) {
        case 400:
          console.error('[SafelinkU DEBUG] ❌ 400 Bad Request - Invalid request body or parameters');
          break;
        case 401:
          console.error('[SafelinkU DEBUG] ❌ 401 Unauthorized - API token is invalid or expired');
          console.error('[SafelinkU DEBUG] Please check your SAFELINKU_API_TOKEN in Vercel environment variables');
          break;
        case 403:
          console.error('[SafelinkU DEBUG] ❌ 403 Forbidden - Access denied (likely Cloudflare protection)');
          
          // Retry with delay for 403 errors
          if (retryCount < MAX_RETRIES) {
            console.log(`[SafelinkU DEBUG] ⏳ Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return createSafelinkUShortlink(originalUrl, alias, retryCount + 1);
          }
          break;
        case 429:
          console.error('[SafelinkU DEBUG] ❌ 429 Rate Limit Exceeded - Too many requests (60/minute limit)');
          
          // Retry with longer delay for rate limit
          if (retryCount < MAX_RETRIES) {
            const rateLimitDelay = 5000; // 5 seconds
            console.log(`[SafelinkU DEBUG] ⏳ Rate limited. Retrying in ${rateLimitDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
            return createSafelinkUShortlink(originalUrl, alias, retryCount + 1);
          }
          break;
        default:
          console.error(`[SafelinkU DEBUG] ❌ ${response.status} Unknown API error`);
      }
      
      return null;
    }

    // Parse JSON response
    let data: SafelinkUResponse;
    try {
      data = JSON.parse(responseText);
      console.log('[SafelinkU DEBUG] ✅ JSON parsed successfully');
      console.log('[SafelinkU DEBUG] Response structure:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('[SafelinkU DEBUG] ❌ Failed to parse JSON response');
      console.error('[SafelinkU DEBUG] Parse error:', parseError);
      console.error('[SafelinkU DEBUG] Response text:', responseText);
      return null;
    }
    
    // Try to extract shortlink from various possible fields
    let shortlink: string | null = null;
    
    if (data.url) {
      shortlink = data.url;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "url" field');
    } else if (data.shortlink) {
      shortlink = data.shortlink;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "shortlink" field');
    } else if (data.short_url) {
      shortlink = data.short_url;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "short_url" field');
    } else if (data.link) {
      shortlink = data.link;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "link" field');
    } else if (data.data?.url) {
      shortlink = data.data.url;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "data.url" field');
    } else if (data.data?.shortlink) {
      shortlink = data.data.shortlink;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "data.shortlink" field');
    } else if (data.data?.short_url) {
      shortlink = data.data.short_url;
      console.log('[SafelinkU DEBUG] ✅ Found shortlink in "data.short_url" field');
    }
    
    if (shortlink) {
      console.log('[SafelinkU DEBUG] ✅ Shortlink created successfully:', shortlink);
      console.log('='.repeat(80));
      return shortlink;
    } else {
      console.error('[SafelinkU DEBUG] ❌ Could not find shortlink in response');
      console.error('[SafelinkU DEBUG] Available fields:', Object.keys(data).join(', '));
      console.error('[SafelinkU DEBUG] Full response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error('[SafelinkU DEBUG] API error:', data.error);
      }
      if (data.message) {
        console.error('[SafelinkU DEBUG] API message:', data.message);
      }
      if (data.success === false) {
        console.error('[SafelinkU DEBUG] API returned success: false');
      }
      
      console.log('='.repeat(80));
      return null;
    }
  } catch (error) {
    console.error('[SafelinkU DEBUG] ❌ Exception occurred during API call');
    console.error('[SafelinkU DEBUG] Error type:', error?.constructor?.name);
    if (error instanceof Error) {
      console.error('[SafelinkU DEBUG] Error message:', error.message);
      console.error('[SafelinkU DEBUG] Error stack:', error.stack);
    } else {
      console.error('[SafelinkU DEBUG] Error:', error);
    }
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(`[SafelinkU DEBUG] ⏳ Network error. Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return createSafelinkUShortlink(originalUrl, alias, retryCount + 1);
    }
    
    console.log('='.repeat(80));
    return null;
  }
}

// Rate limiting helper to respect 60 requests per minute limit
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60;
  private readonly timeWindow = 60 * 1000; // 1 minute in milliseconds

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      // Wait until the oldest request is more than 1 minute old
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer
      
      console.log(`[SafelinkU RateLimiter] ⏳ Rate limit reached (${this.requests.length}/${this.maxRequests}), waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Clean up again after waiting
      const afterWait = Date.now();
      this.requests = this.requests.filter(time => afterWait - time < this.timeWindow);
    }
    
    this.requests.push(now);
    console.log(`[SafelinkU RateLimiter] ✅ Request allowed (${this.requests.length}/${this.maxRequests} in current window)`);
  }
}

const rateLimiter = new RateLimiter();

export async function createSafelinkUShortlinkWithRateLimit(originalUrl: string, alias?: string): Promise<string | null> {
  console.log(`[SafelinkU] Request with rate limiting for: ${originalUrl}`);
  await rateLimiter.waitIfNeeded();
  return createSafelinkUShortlink(originalUrl, alias);
}