import { SocialPost, supabase } from '../lib/supabase';

export const isValidTikTokUrl = (url: string): boolean => {
  const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
  return tiktokPattern.test(url);
};

export const scrapeTikTokVideo = async (url: string): Promise<SocialPost | null> => {
  try {
    const videoIdMatch = url.match(/\/(?:v|@[\w.-]+\/video)\/(\d+)/);
    const videoId = videoIdMatch?.[1];
    
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }

    let metadata: any = null;
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        metadata = await response.json();
      }
    } catch (error) {
      // Continue without metadata
    }

    const videoData: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'> = {
      url,
      title: metadata?.title || `TikTok Video - ${new Date().toLocaleDateString()}`,
      source: 'TikTok',
      type: 'tiktok',
      thumbnail_url: metadata?.thumbnail_url || generateThumbnailUrl(videoId),
      post_id: videoId,
      author: metadata?.author_name,
      author_id: extractAuthorId(url),
      location: extractLocation(metadata?.title || ''),
      captions: metadata?.title || '',
      description: metadata?.title || '',
      play_count: 0,
      digg_count: 0,
      comment_count: 0,
      share_count: 0,
      like_count: 0,
      duration: 0,
    };

    const { data, error } = await supabase
      .from('social_posts')
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error scraping TikTok video:', error);
    return null;
  }
};

const generateThumbnailUrl = (videoId: string): string => {
  const patterns = [
    `https://p16-sign-va.tiktokcdn-us.com/obj/tos-useast2a-p-0068-tx/placeholder_${videoId}.jpeg`,
    `https://p16-sign.tiktokcdn-us.com/obj/tos-useast2a-p-0068-tx/${videoId}_1.jpeg`,
    `https://p16-sign-va.tiktokcdn-us.com/obj/tos-useast2a-p-0068-tx/${videoId}_1.jpeg`,
    `https://p16-sign.tiktokcdn-us.com/obj/tos-useast2a-p-0068-tx/${videoId}.jpeg`
  ];
  return patterns[0];
};

const extractAuthorId = (url: string): string | undefined => {
  const authorMatch = url.match(/@([^\/]+)/);
  return authorMatch?.[1];
};

const extractLocation = (title: string): string | undefined => {
  const locationPatterns = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /#([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return undefined;
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

