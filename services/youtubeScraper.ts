import { SocialPost, supabase } from '../lib/supabase';

export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/(watch\?v=|shorts\/))[\w-]+/;
  return youtubePattern.test(url);
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/v\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const extractChannelId = (url: string): string | null => {
  return null;
};

export const extractLocation = (title: string): string | null => {
  const locationPatterns = [
    /@\s*([^,]+)/i,
    /in\s+([^,]+)/i,
    /from\s+([^,]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

export const generateThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const scrapeYouTubeVideo = async (url: string): Promise<SocialPost | null> => {
  try {
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }

    let metadata: any = null;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (response.ok) {
        metadata = await response.json();
      }
    } catch (error) {
      // Continue without metadata
    }

    const videoData: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'> = {
      url,
      title: metadata?.title || `YouTube Video - ${new Date().toLocaleDateString()}`,
      source: 'YouTube',
      type: 'youtube',
      thumbnail_url: metadata?.thumbnail_url || generateThumbnailUrl(videoId),
      post_id: videoId,
      author: metadata?.author_name,
      author_id: extractChannelId(url) || undefined,
      location: extractLocation(metadata?.title || '') || undefined,
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
    console.error('Error scraping YouTube video:', error);
    throw error;
  }
};
