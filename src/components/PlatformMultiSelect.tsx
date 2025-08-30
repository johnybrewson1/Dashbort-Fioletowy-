import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Instagram, Music, Youtube, Linkedin, Twitter, FileText, Facebook } from 'lucide-react';

interface PlatformSelection {
  instagram: boolean;
  tiktok: boolean;
  youtube: boolean;
  linkedin: boolean;
  x: boolean;
  facebook: boolean;
  blog: boolean;
}

interface ContentTypes {
  instagram: string[];
  tiktok: string[];
  youtube: string[];
  linkedin: string[];
  x: string[];
  facebook: string[];
  blog: string[];
}

interface PlatformMultiSelectProps {
  selectedPlatforms: PlatformSelection;
  onPlatformChange: (platforms: PlatformSelection) => void;
  selectedContentTypes: ContentTypes;
  onContentTypeChange: (platform: keyof ContentTypes, types: string[]) => void;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  blogPurpose?: string;
  onBlogPurposeChange?: (purpose: string) => void;
}

const PlatformMultiSelect: React.FC<PlatformMultiSelectProps> = ({
  selectedPlatforms,
  onPlatformChange,
  selectedContentTypes,
  onContentTypeChange,
  imageUrl,
  onImageUrlChange,
  blogPurpose,
  onBlogPurposeChange
}) => {
  const platforms = [
    { key: 'instagram', name: 'Instagram 📷', icon: Instagram },
    { key: 'tiktok', name: 'TikTok 🎵', icon: Music },
    { key: 'youtube', name: 'YouTube ▶️', icon: Youtube },
    { key: 'linkedin', name: 'LinkedIn 💼', icon: Linkedin },
    { key: 'x', name: 'X 🐦', icon: Twitter },
    { key: 'facebook', name: 'Facebook 👥', icon: Facebook },
    { key: 'blog', name: 'Blog 📝', icon: FileText }
  ];

  const contentTypeOptions = {
    instagram: ['Post', 'Captions', 'Filmy'],
    tiktok: ['Filmy'],
    youtube: ['Haczyki', 'Krótki skrypt', 'Średni skrypt', 'Captions', 'Filmy'],
    linkedin: ['Text', 'Text + Image', 'Filmy'],
    x: ['Text', 'Text + Image', 'Filmy'],
    facebook: ['Text', 'Text + Image', 'Filmy'],
    blog: []
  };

  const handlePlatformToggle = (platformKey: keyof PlatformSelection) => {
    const newPlatforms = {
      ...selectedPlatforms,
      [platformKey]: !selectedPlatforms[platformKey]
    };
    onPlatformChange(newPlatforms);
    
    // Clear content types when platform is deselected
    if (!newPlatforms[platformKey] && platformKey in contentTypeOptions) {
      onContentTypeChange(platformKey as keyof ContentTypes, []);
    }
  };

  const handleContentTypeToggle = (platform: keyof ContentTypes, contentType: string) => {
    const currentTypes = selectedContentTypes[platform] || [];
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(type => type !== contentType)
      : [...currentTypes, contentType];
    
    onContentTypeChange(platform, newTypes);
  };

  const shouldShowImageUrl = () => {
    return selectedContentTypes.instagram?.includes('Post') ||
           selectedContentTypes.youtube?.length > 0 ||
           selectedContentTypes.linkedin?.includes('Text + Image') ||
           selectedContentTypes.x?.includes('Text + Image');
  };

  return (
    <div className="space-y-6 mb-8">
      <Label className="text-2xl font-bold text-foreground">
        Wybierz swoje platformy
      </Label>
      
      {/* Platform Grid */}
      <div className="grid grid-cols-7 gap-4">
        {platforms.map(({ key, name, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handlePlatformToggle(key as keyof PlatformSelection)}
            className={`h-24 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 transition-all duration-300 ${
              selectedPlatforms[key as keyof PlatformSelection]
                ? 'platform-selected border-primary'
                : 'border-form-container-border hover:border-primary/50 bg-surface/50'
            }`}
          >
            <Icon className="w-8 h-8" />
            <span className="text-sm font-medium leading-tight">{name}</span>
          </button>
        ))}
      </div>

      {/* Content Type Options */}
      {(selectedPlatforms.instagram || selectedPlatforms.youtube || selectedPlatforms.linkedin || selectedPlatforms.x || selectedPlatforms.blog) && (
        <div className="space-y-4">
          {selectedPlatforms.instagram && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje Instagram:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.instagram.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('instagram', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.instagram?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.youtube && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje YouTube:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.youtube.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('youtube', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.youtube?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.linkedin && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje LinkedIn:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.linkedin.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('linkedin', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.linkedin?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.x && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje X:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.x.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('x', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.x?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.tiktok && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje TikTok:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.tiktok.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('tiktok', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.tiktok?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.facebook && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje Facebook:</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.facebook.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleContentTypeToggle('facebook', type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedContentTypes.facebook?.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface border border-form-container-border hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPlatforms.blog && (
            <div>
              <Label htmlFor="blog-purpose" className="text-sm font-medium text-muted-foreground mb-2 block">
                Jaki jest cel artykułu?
              </Label>
              <Input
                id="blog-purpose"
                placeholder="Np. Edukacyjny, promocyjny, informacyjny..."
                value={blogPurpose || ''}
                onChange={(e) => onBlogPurposeChange?.(e.target.value)}
                className="input-field text-white placeholder:text-gray-400"
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PlatformMultiSelect;