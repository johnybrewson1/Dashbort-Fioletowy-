# 🚀 Dream Post Forge

**AI-powered social media content creation tool** that transforms your ideas into viral posts across multiple platforms.

[![Netlify Status](https://api.netlify.com/api/v1/badges/68b31e30230743e0feff0ce1/deploy-status)](https://app.netlify.com/sites/dream-post-forge/deploys)

## ✨ Features

### 🎯 **Multi-Platform Content Creation**
- **Instagram** - Posts, Captions, Videos
- **TikTok** - Video content
- **YouTube** - Hooks, Scripts, Captions, **Thumbnail support**
- **LinkedIn** - Professional content
- **X (Twitter)** - Engaging posts
- **Facebook** - Social media content
- **Blog** - Long-form articles

### 🤖 **AI-Powered Generation**
- **Magic Agent** - Create content from scratch
- **YouTube Integration** - Generate content from videos
- **Ranking Analysis** - Create content from trending topics
- **Smart Thumbnails** - Auto-generate from YouTube URLs

### 🎨 **Advanced Customization**
- **Voice & Style** settings
- **Platform-specific** content types
- **Thumbnail integration** for YouTube
- **Custom guidelines** and instructions

## 🚀 Live Demo

**🌐 [https://dream-post-forge.netlify.app](https://dream-post-forge.netlify.app)**

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (Database + Auth)
- **Deployment:** Netlify
- **State Management:** React Hooks + Context
- **Styling:** Tailwind CSS + CSS Modules

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dream-post-forge.git
cd dream-post-forge

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Create a new Supabase project
2. Set up your database tables
3. Configure authentication
4. Add your credentials to `.env`

## 📱 Usage

### 1. **Magic Agent**
- Write your content idea
- Select target platforms
- Generate AI-powered posts

### 2. **YouTube Integration**
- Paste YouTube URL
- Choose content type (including Thumbnail)
- Generate platform-specific content

### 3. **Ranking Analysis**
- Select trending topics
- Use thumbnail integration
- Create viral content

## 🏗️ Project Structure

```
dream-post-forge/
├── src/
│   ├── components/          # React components
│   │   ├── modals/         # Modal dialogs
│   │   ├── sections/       # Main page sections
│   │   └── ui/            # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   ├── lib/               # Utility functions
│   └── pages/             # Page components
├── public/                 # Static assets
├── supabase/              # Database migrations
└── netlify.toml          # Netlify configuration
```

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automatically on push

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful components
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **Netlify** for hosting

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/dream-post-forge/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/dream-post-forge/discussions)

---

**⭐ Star this repository if you found it helpful!**
