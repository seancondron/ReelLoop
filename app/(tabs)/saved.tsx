import { memo, useRef, useState } from 'react';
import { Alert, Clipboard, Image, Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSavedItems } from '../../contexts/SavedItemsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { isValidInstagramUrl } from '../../services/instagramScraper';
import { isValidTikTokUrl } from '../../services/tiktokScraper';
import { isValidYouTubeUrl } from '../../services/youtubeScraper';

export default function SavedScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Boards');
  const [urlInput, setUrlInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { savedItems, addSocialPost, removeSavedItem, isLoading } = useSavedItems();
  const scrollViewRef = useRef<ScrollView>(null);

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleSharePost = async (item: any) => {
    try {
      const shareContent = {
        message: `Check out this ${item.source} post: ${truncateText(item.title || 'Saved Post', 60)}\n\n${item.url}`,
        url: item.url,
        title: truncateText(item.title || `${item.source} Post`, 50),
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content');
    }
  };

  const openSocialPost = async (url: string) => {
    try {
      await Linking.openURL(url);
      
    } catch (error) {
      console.error('Error opening video:', error);
      
      let platformName = 'video';
      let appName = 'the app';
      
      if (url.includes('tiktok.com')) {
        platformName = 'TikTok video';
        appName = 'TikTok app';
      } else if (url.includes('instagram.com')) {
        platformName = 'Instagram post';
        appName = 'Instagram app';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platformName = 'YouTube video';
        appName = 'YouTube app';
      }
      Alert.alert(
        'Cannot Open Video', 
        `Unable to open the ${platformName} automatically.\n\nURL: ${url}\n\nYou can:\n• Copy the URL and paste it in your browser\n• Open ${appName} and search for the content\n• Check your internet connection`,
        [
          {
            text: 'Copy URL',
            onPress: async () => {
              try {
                await Clipboard.setString(url);
                Alert.alert('Copied!', 'URL copied to clipboard');
              } catch (error) {
                console.error('Error copying to clipboard:', error);
                Alert.alert('Error', 'Could not copy URL to clipboard');
              }
            }
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    const trimmedUrl = urlInput.trim();
    let isValidUrl = false;
    let platformName = '';

    if (isValidTikTokUrl(trimmedUrl)) {
      isValidUrl = true;
      platformName = 'TikTok';
    } else if (isValidInstagramUrl(trimmedUrl)) {
      isValidUrl = true;
      platformName = 'Instagram';
    } else if (isValidYouTubeUrl(trimmedUrl)) {
      isValidUrl = true;
      platformName = 'YouTube';
    }

    if (!isValidUrl) {
      Alert.alert('Error', 'Please enter a valid TikTok, Instagram, or YouTube URL');
      return;
    }

    setIsAdding(true);
    try {
      await addSocialPost(trimmedUrl);
      setUrlInput('');
      Alert.alert('Success', `${platformName} post scraped and saved!`);
    } catch (error) {
      console.error('Error adding social post:', error);
      Alert.alert('Error', 'Failed to scrape and save the post');
    } finally {
      setIsAdding(false);
    }
  };

  const SavedItemComponent = memo(({ item }: { item: any }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <TouchableOpacity 
        style={[styles.savedItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => openSocialPost(item.url)}
        onLongPress={async () => {
          try {
            await Clipboard.setString(item.url);
            Alert.alert('Copied!', 'URL copied to clipboard');
          } catch (error) {
            Alert.alert('Error', 'Could not copy URL to clipboard');
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemSource, { color: theme.colors.accent }]}>{item.source ? item.source : 'Saved'}</Text>
          <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
            {new Date(item.dateSaved).toLocaleDateString()}
          </Text>
        </View>
        
        {item.thumbnail_url && (
          <View style={styles.thumbnailContainer}>
            {imageLoading && (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.placeholderText}>Loading thumbnail...</Text>
              </View>
            )}
            <Image 
              source={{ uri: item.thumbnail_url }}
              style={[styles.thumbnail, imageLoading && { opacity: 0 }]}
              resizeMode="cover"
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageError && (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.placeholderText}>Thumbnail unavailable</Text>
              </View>
            )}
          </View>
        )}
        
        {item.title ? (
          <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{truncateText(item.title, 80)}</Text>
        ) : null}
        
        {item.title && item.title && item.title.includes('Restricted Access') && (
          <View style={[styles.restrictedIndicator, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
            <Text style={[styles.restrictedText, { color: theme.colors.warning }]}>🔒 This post is private or restricted</Text>
          </View>
        )}
        
        {item.author ? (
          <Text style={[styles.authorText, { color: theme.colors.textSecondary }]}>by @{item.author}</Text>
        ) : null}
        
        {item.location ? (
          <Text style={[styles.locationText, { color: theme.colors.accent }]}>📍 {item.location}</Text>
        ) : null}
        
        {item.description ? (
          <Text style={[styles.descriptionText, { color: theme.colors.text }]}>{truncateText(item.description, 120)}</Text>
        ) : null}
        
        {(item.play_count || item.digg_count || item.comment_count || item.share_count || item.like_count) ? (
          <View style={[styles.statsContainer, { backgroundColor: theme.colors.background }]}>
            {item.play_count ? (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>👀 {item.play_count.toLocaleString()}</Text>
            ) : null}
            {item.digg_count ? (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>❤️ {item.digg_count.toLocaleString()}</Text>
            ) : null}
            {item.like_count ? (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>❤️ {item.like_count.toLocaleString()}</Text>
            ) : null}
            {item.comment_count ? (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>💬 {item.comment_count.toLocaleString()}</Text>
            ) : null}
            {item.share_count ? (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>📤 {item.share_count.toLocaleString()}</Text>
            ) : null}
          </View>
        ) : null}
        
        {item.url ? (
          <View style={styles.urlContainer}>
            <Text style={[styles.urlLabel, { color: theme.colors.textSecondary }]}>URL:</Text>
            <Text style={[styles.urlText, { color: theme.colors.accent }]}>{item.url}</Text>
          </View>
        ) : null}

        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: theme.colors.accent }]}
            onPress={(e) => {
              e.stopPropagation();
              handleSharePost(item);
            }}
          >
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                'Delete Post',
                'Are you sure you want to delete this post?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => removeSavedItem(item.id),
                  },
                ]
              );
            }}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  });
  
  SavedItemComponent.displayName = 'SavedItemComponent';

  const renderSavedItem = (item: any) => (
    <SavedItemComponent key={item.id} item={item} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Boards':
        return (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.inputSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Add Social Media Post</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Paste TikTok or Instagram URL here..."
                placeholderTextColor={theme.colors.textSecondary}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity 
                style={[styles.addButton, (isAdding || isLoading) && styles.addButtonDisabled]} 
                onPress={handleAddUrl}
                disabled={isAdding || isLoading}
              >
                <Text style={styles.addButtonText}>
                  {isAdding ? 'Scraping post...' : isLoading ? 'Loading...' : 'Add Social Post'}
                </Text>
              </TouchableOpacity>
              
            </View>

            {savedItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Your Boards</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>No content yet.</Text>
                <Text style={[styles.instructions, { color: theme.colors.textSecondary }]}>
                  Paste a TikTok or Instagram URL above to get started
                </Text>
              </View>
            ) : (
              <View style={styles.savedItemsContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Saved Content ({savedItems.length})</Text>
                {savedItems.map(renderSavedItem)}
              </View>
            )}
          </View>
        );
      case 'Maps':
        return (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Maps</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your saved maps will appear here</Text>
          </View>
        );
      case 'Recipes':
        return (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Recipes</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your saved recipes will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {['Boards', 'Maps', 'Recipes'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === tab ? theme.colors.accent : 'transparent',
                borderRadius: 8,
                marginHorizontal: 4
              },
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
              { 
                color: activeTab === tab ? '#FFFFFF' : theme.colors.text,
                fontWeight: activeTab === tab ? '600' : '500'
              }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  savedItemsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  savedItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  urlContainer: {
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  textContainer: {
    marginBottom: 8,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  textContent: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  thumbnailContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 80,
    backgroundColor: '#F2F2F7',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  debugText: {
    color: '#8E8E93',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  authorText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  locationText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  tapIndicator: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  tapIndicatorText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  restrictedIndicator: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  restrictedText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
});
