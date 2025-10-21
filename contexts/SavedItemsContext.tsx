import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SocialPost } from '../lib/supabase';
import { scrapeInstagramPost } from '../services/instagramScraper';
import { deletePost, getSavedPosts, scrapeTikTokVideo } from '../services/tiktokScraper';
import { scrapeYouTubeVideo } from '../services/youtubeScraper';

interface SavedItem extends SocialPost {
  dateSaved: number;
}

interface SavedItemsContextType {
  savedItems: SavedItem[];
  addSocialPost: (url: string) => Promise<void>;
  removeSavedItem: (id: string) => Promise<void>;
  clearAllItems: () => Promise<void>;
  isLoading: boolean;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

interface SavedItemsProviderProps {
  children: ReactNode;
}

export function SavedItemsProvider({ children }: SavedItemsProviderProps) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      const posts = await getSavedPosts();
      
      // Convert SocialPost to SavedItem format
      const convertedItems: SavedItem[] = posts.map(post => ({
        ...post,
        dateSaved: new Date(post.created_at).getTime(),
      }));
      
      setSavedItems(convertedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialPost = async (url: string) => {
    try {
      setIsLoading(true);
      let scrapedPost: SocialPost | null = null;
      
      // Determine if it's TikTok, Instagram, or YouTube
      if (url.includes('tiktok.com') || url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
        console.log('Detected TikTok URL, using TikTok scraper');
        scrapedPost = await scrapeTikTokVideo(url);
      } else if (url.includes('instagram.com') || url.includes('instagr.am')) {
        console.log('Detected Instagram URL, using Instagram scraper');
        scrapedPost = await scrapeInstagramPost(url);
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        console.log('Detected YouTube URL, using YouTube scraper');
        scrapedPost = await scrapeYouTubeVideo(url);
      } else {
        console.log('Unsupported URL format:', url);
        throw new Error('Unsupported URL format');
      }
      
      if (scrapedPost) {
        const newItem: SavedItem = {
          ...scrapedPost,
          dateSaved: new Date(scrapedPost.created_at).getTime(),
        };
        
        setSavedItems(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error('Error adding social post:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedItem = async (id: string) => {
    try {
      const success = await deletePost(id);
      if (success) {
        setSavedItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  const clearAllItems = async () => {
    try {
      // Delete all items from Supabase
      for (const item of savedItems) {
        await deletePost(item.id);
      }
      setSavedItems([]);
    } catch (error) {
      console.error('Error clearing all items:', error);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  return (
    <SavedItemsContext.Provider
      value={{
        savedItems,
        addSocialPost,
        removeSavedItem,
        clearAllItems,
        isLoading,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
}
