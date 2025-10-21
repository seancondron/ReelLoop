export const APIFY_CONFIG = {
  apiToken: process.env.EXPO_PUBLIC_APIFY_API_TOKEN || '',
  baseUrl: 'https://api.apify.com/v2',
  instagramActorId: 'shu8hvrXbJbY3Eb9W',
};

// Debug logging
console.log('Apify Config:', {
  hasToken: !!APIFY_CONFIG.apiToken,
  tokenLength: APIFY_CONFIG.apiToken.length,
  baseUrl: APIFY_CONFIG.baseUrl,
  actorId: APIFY_CONFIG.instagramActorId
});

if (!APIFY_CONFIG.apiToken) {
  console.warn(
    'Apify API Token is missing. Please set EXPO_PUBLIC_APIFY_API_TOKEN in your environment variables.'
  );
}
