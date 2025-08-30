import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Instagram, Music, Youtube, Linkedin, Twitter, FileText, Sparkles, Facebook } from 'lucide-react';
interface TextTabProps {
  content: string;
  setContent: (content: string) => void;
  selectedPlatforms: {
    instagram: boolean;
    tiktok: boolean;
    youtube: boolean;
    linkedin: boolean;
    x: boolean;
    facebook: boolean;
    blog: boolean;
  };
  onPlatformChange: (platform: string, checked: boolean) => void;
  selectedContentTypes: {
    instagram: string[];
    youtube: string[];
    linkedin: string[];
    x: string[];
    blog: string[];
  };
  onContentTypeChange: (platform: string, types: string[]) => void;
  loading: boolean;
  onSubmit: () => void;
}
export const TextTab: React.FC<TextTabProps> = ({
  content,
  setContent,
  selectedPlatforms,
  onPlatformChange,
  selectedContentTypes,
  onContentTypeChange,
  loading,
  onSubmit
}) => {
  const [blogPurpose, setBlogPurpose] = useState('');
  const platforms = [{
    key: 'instagram',
    name: 'Instagram 📷',
    icon: Instagram
  }, {
    key: 'tiktok',
    name: 'TikTok 🎵',
    icon: Music
  }, {
    key: 'youtube',
    name: 'YouTube ▶️',
    icon: Youtube
  }, {
    key: 'linkedin',
    name: 'LinkedIn 💼',
    icon: Linkedin
  }, {
    key: 'x',
    name: 'X 🐦',
    icon: Twitter
  }, {
    key: 'facebook',
    name: 'Facebook 👥',
    icon: Facebook
  }, {
    key: 'blog',
    name: 'Blog 📝',
    icon: FileText
  }];
  const contentTypeOptions = {
    instagram: ['Post', 'Captions'],
    youtube: ['Haczyki', 'Krótki skrypt', 'Średni skrypt', 'Captions'],
    blog: []
  };
  const handlePlatformToggle = (platformKey: string) => {
    onPlatformChange(platformKey, !selectedPlatforms[platformKey as keyof typeof selectedPlatforms]);
  };
  
  const handleContentTypeToggle = (platform: string, type: string) => {
    const currentTypes = selectedContentTypes[platform as keyof typeof selectedContentTypes] || [];
    const newTypes = currentTypes.includes(type) ? currentTypes.filter(t => t !== type) : [...currentTypes, type];
    onContentTypeChange(platform, newTypes);
  };
  
  const handleSubmitWithBlogPurpose = () => {
    // Jeśli blog jest wybrany, można tutaj dodać logikę przekazania blogPurpose
    // Na razie wywołujemy oryginalny onSubmit
    onSubmit();
  };
  return <div className="space-y-6">
      <div>
        <Label htmlFor="content-input" className="text-lg font-semibold text-foreground mb-3 block">
          Wpisz swoją treść
        </Label>
        <Textarea id="content-input" placeholder="Opisz o czym chcesz stworzyć content..." value={content} onChange={e => setContent(e.target.value)} className="input-field text-lg p-6 min-h-32 resize-none text-white placeholder:text-gray-400" rows={4} />
      </div>

      <div className="space-y-6">
        <Label className="text-lg font-semibold text-foreground">Wybierz swoje platformy</Label>
        
      {/* Platform Grid */}
      <div className="grid grid-cols-7 gap-4">
          {platforms.map(({
          key,
          name,
          icon: Icon
        }) => <button key={key} onClick={() => handlePlatformToggle(key)} className={`h-24 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 transition-all duration-300 ${selectedPlatforms[key as keyof typeof selectedPlatforms] ? 'platform-selected border-primary' : 'border-form-container-border hover:border-primary/50 bg-surface/50'}`}>
              <Icon className="w-8 h-8" />
              <span className="text-sm font-medium leading-tight">{name}</span>
            </button>)}
        </div>

        {/* Content Type Options */}
        {(selectedPlatforms.instagram || selectedPlatforms.youtube || selectedPlatforms.blog) && <div className="space-y-4">
            {selectedPlatforms.instagram && <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Opcje Instagram:</p>
                <div className="flex flex-wrap gap-2">
                  {contentTypeOptions.instagram.map(type => <button key={type} onClick={() => handleContentTypeToggle('instagram', type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedContentTypes.instagram?.includes(type) ? 'bg-primary text-primary-foreground' : 'bg-surface border border-form-container-border hover:border-primary/50'}`}>
                      {type}
                    </button>)}
                </div>
              </div>}

            {selectedPlatforms.youtube && <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Opcje YouTube:</p>
                <div className="flex flex-wrap gap-2">
                  {contentTypeOptions.youtube.map(type => <button key={type} onClick={() => handleContentTypeToggle('youtube', type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedContentTypes.youtube?.includes(type) ? 'bg-primary text-primary-foreground' : 'bg-surface border border-form-container-border hover:border-primary/50'}`}>
                      {type}
                    </button>)}
                </div>
              </div>}

            {selectedPlatforms.blog && <div>
                <Label htmlFor="blog-purpose" className="text-sm font-medium text-muted-foreground mb-2 block">
                  Jaki jest cel artykułu?
                </Label>
                <Input
                  id="blog-purpose"
                  placeholder="Np. Edukacyjny, promocyjny, informacyjny..."
                  value={blogPurpose}
                  onChange={(e) => setBlogPurpose(e.target.value)}
                  className="input-field text-white placeholder:text-gray-400"
                />
              </div>}
          </div>}
      </div>

      <Button onClick={handleSubmitWithBlogPurpose} disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 text-lg">
        {loading ? <>
            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
            Generowanie...
          </> : <>
            <Sparkles className="w-5 h-5 mr-2" />
            Stwórz magiczny content ✨
          </>}
      </Button>
    </div>;
};