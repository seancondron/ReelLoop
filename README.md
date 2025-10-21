# ReelLoop 📱


ReelLoop helps you organize, prioritize, and act on your saved inspiration. Automatically import posts or links from your favorite platforms, tag and categorize them, and turn each idea into an actionable step or goal. Set reminders, track progress, and finally bring your creative inspirations to life, one saved post at a time.

Built with Expo, React Native, TypeScript, Expo Router, Apify, and Supabase (PostgreSQL).


## ✨ Features

- **Multi-Platform Support**: Save content from TikTok, Instagram, and YouTube
- **Smart Scraping**: Automatically extracts metadata, thumbnails, and engagement stats
- **Organized Storage**: Categorize saved content with custom boards
- **Dark Mode**: Multiple darkness levels for comfortable viewing
- **Share Integration**: Easy sharing of saved content

## 🚧 In Progress

- **AI Summary**: Intelligent content summarization using AI
- **Share to App**: Allow user to click share button and share directly to ReelLoop
- **Map Pinning**: Geotag and visualize saved content on interactive maps
- **Home Screen**: Comprehensive content review and recommended actions
- **Login**: OAuth login functionality

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ReelLoop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration in the `.env` file (See 'Configuration' section below).

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## 🏗️ Project Structure

```
ReelLoop/
├── app/                    # Main app screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── saved.tsx      # Saved content screen
│   │   └── settings.tsx   # Settings screen
│   ├── login.tsx          # Authentication screen
│   └── _layout.tsx        # Root layout
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── SavedItemsContext.tsx # Saved content state
│   └── ThemeContext.tsx  # Theme management
├── services/              # API and scraping services
│   ├── instagramScraper.ts
│   ├── tiktokScraper.ts
│   └── youtubeScraper.ts
├── config/                # Configuration files
│   ├── apify.ts          # Apify API configuration
│   └── supabase.ts       # Supabase configuration
└── lib/                   # Utility libraries
    └── supabase.ts       # Supabase client
```

## 🔧 Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Apify Configuration (for Instagram scraping)
APIFY_API_TOKEN=your_apify_token
APIFY_INSTAGRAM_ACTOR_ID=your_instagram_actor_id
```

### Database Setup

1. Create a Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Update your environment variables with Supabase credentials

## 📱 Usage

### Saving Content

1. **Open the app** and navigate to the "Saved" tab
2. **Paste a URL** from TikTok, Instagram, or YouTube
3. **Tap "Add Social Post"** to scrape and save the content
4. **View saved content** in your organized boards

### Managing Content

- **View Details**: Tap any saved item to see full details
- **Open Original**: Tap to open the original post in the respective app
- **Delete**: Long press and confirm to remove items
- **Copy URL**: Long press to copy the original URL

### Settings

- **Dark Mode**: Toggle between light and dark themes
- **Darkness Level**: Choose from Gray, Dark Gray, or Black
- **Restricted Posts**: Configure how to handle private/restricted content

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Lint code
npm run lint
```

### Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context
- **Database**: Supabase
- **Scraping**: Instagram Apify API. TikTok oEmbed API, YouTube oEmbed API
- **Styling**: React Native StyleSheet


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the amazing development platform
- [Supabase](https://supabase.com) for the backend infrastructure
- [TikTok](https://developers.tiktok.com/doc/embed-videos/) and [YouTube](https://developers.google.com/youtube/v3) for easy to use APIs
- [Apify](https://apify.com) for Instagram scraping capabilities
- [React Native](https://reactnative.dev) for the mobile framework

---

**Made with ❤️ for content creators and social media enthusiasts**