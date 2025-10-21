import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIFY_CONFIG } from '../config/apify';
import { SocialPost, supabase } from '../lib/supabase';

export const isValidInstagramUrl = (url: string): boolean => {
  const instagramPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/;
  return instagramPattern.test(url);
};

// Test Apify connection
export const testApifyConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${APIFY_CONFIG.baseUrl}/acts/${APIFY_CONFIG.instagramActorId}`, {
      headers: {
        'Authorization': `Bearer ${APIFY_CONFIG.apiToken}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Apify connection test failed:', error);
    return false;
  }
};

export const scrapeInstagramPost = async (url: string): Promise<SocialPost | null> => {
  try {
    try {
      const userResponse = await fetch(`${APIFY_CONFIG.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${APIFY_CONFIG.apiToken}`,
        },
      });
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`Apify API token invalid: ${userResponse.status} - ${errorText}`);
      }
    } catch (error) {
      throw new Error(`Apify API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const connectionOk = await testApifyConnection();
    if (!connectionOk) {
      throw new Error('Apify connection test failed - check your API token and actor ID');
    }
    
    const postIdMatch = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    const postId = postIdMatch?.[1];
    
    if (!postId) {
      throw new Error('Could not extract post ID from URL');
    }

    const authorMatch = url.match(/instagram\.com\/([^\/]+)/);
    const author = authorMatch?.[1];

    const apifyData = await scrapeWithApify(url);

    if (!apifyData) {
      throw new Error('Apify returned no data for this Instagram post');
    }

    if (apifyData.error) {
      if (apifyData.error === 'restricted_page') {
        try {
          const skipRestrictedPosts = await AsyncStorage.getItem('skipRestrictedPosts');
          const shouldSkip = skipRestrictedPosts === 'true';
          
          if (shouldSkip) {
            throw new Error('This Instagram post is private or restricted. Skipping as per your settings.');
          }
        } catch (storageError) {
          // Continue with restricted post handling
        }

        const restrictedPostData: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'> = {
          url,
          title: `Instagram Post (Restricted Access)`,
          source: 'Instagram',
          type: 'instagram',
          thumbnail_url: null,
          post_id: postId,
          author: 'Unknown',
          author_id: null,
          location: null,
          captions: 'This Instagram post is private or restricted. Limited information available.',
          description: 'This Instagram post is private or restricted. Limited information available.',
          comment_count: 0,
          share_count: 0,
          play_count: 0,
          digg_count: 0,
          like_count: 0,
          duration: 0,
        };

        const { data, error } = await supabase
          .from('social_posts')
          .insert(restrictedPostData)
          .select()
          .single();

        if (error) {
          console.error('Error saving restricted post to Supabase:', error);
          throw error;
        }

        return data;
      } else {
        throw new Error(`Instagram post error: ${apifyData.error} - ${apifyData.errorDescription || 'Unknown error'}`);
      }
    }
    const postData: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'> = {
      url,
      title: apifyData.caption || apifyData.text || `Instagram Post by @${apifyData.ownerUsername || apifyData.username || 'unknown'}`,
      source: 'Instagram',
      type: 'instagram',
      thumbnail_url: apifyData.displayUrl || apifyData.imageUrl || apifyData.thumbnailUrl,
      post_id: postId,
      author: apifyData.ownerUsername || apifyData.username || 'Unknown',
      author_id: apifyData.ownerUsername || apifyData.username,
      location: apifyData.locationName || apifyData.location,
      captions: apifyData.caption || apifyData.text || `Instagram post by @${apifyData.ownerUsername || apifyData.username || 'unknown'}`,
      description: apifyData.caption || apifyData.text || `Instagram post by @${apifyData.ownerUsername || apifyData.username || 'unknown'}`,
      comment_count: apifyData.commentsCount || apifyData.commentCount || 0,
      share_count: 0,
      play_count: apifyData.videoViewCount || apifyData.viewCount || 0,
      digg_count: 0,
      like_count: apifyData.likesCount || apifyData.likeCount || 0,
      duration: apifyData.videoDuration || apifyData.duration || 0,
    };

    const { data, error } = await supabase
      .from('social_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error scraping Instagram post with Apify:', error);
    throw new Error(`Failed to scrape Instagram post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Apify Instagram scraping function
const scrapeWithApify = async (url: string): Promise<any> => {
  if (!APIFY_CONFIG.apiToken) {
    throw new Error('Apify API token not configured');
  }

  const actorId = 'shu8hvrXbJbY3Eb9W';
  
  const runResponse = await fetch(`${APIFY_CONFIG.baseUrl}/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APIFY_CONFIG.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startUrls: [url],
      resultsType: 'posts',
      maxItems: 1,
      directUrls: [url],
    }),
  });

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    throw new Error(`Apify run failed: ${runResponse.status} - ${errorText}`);
  }

  const runData = await runResponse.json();
  const runId = runData.data.id;

  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const statusResponse = await fetch(`${APIFY_CONFIG.baseUrl}/actor-runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${APIFY_CONFIG.apiToken}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check run status: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.data.status === 'SUCCEEDED') {
      const resultsResponse = await fetch(`${APIFY_CONFIG.baseUrl}/actor-runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${APIFY_CONFIG.apiToken}`,
        },
      });

      if (!resultsResponse.ok) {
        throw new Error(`Failed to get results: ${resultsResponse.status}`);
      }

      const results = await resultsResponse.json();
      
      if (results.length > 0) {
        return results[0];
      } else {
        throw new Error('No results returned from Apify');
      }
    } else if (statusData.data.status === 'FAILED' || statusData.data.status === 'ABORTED') {
      throw new Error(`Apify run failed with status: ${statusData.data.status}`);
    }

    attempts++;
  }

  throw new Error('Apify run timed out');
};


export const getSavedPosts = async (): Promise<SocialPost[]> => {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const deletePost = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};
