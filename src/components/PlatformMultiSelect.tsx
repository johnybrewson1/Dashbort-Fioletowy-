import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Instagram, Code, Linkedin, Twitter, FileText, Facebook } from 'lucide-react';

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
  useThumbnail?: boolean;
  onUseThumbnailChange?: (useThumbnail: boolean) => void;
}

const PlatformMultiSelect: React.FC<PlatformMultiSelectProps> = ({
  selectedPlatforms,
  onPlatformChange,
  selectedContentTypes,
  onContentTypeChange,
  imageUrl,
  onImageUrlChange,
  blogPurpose,
  onBlogPurposeChange,
  useThumbnail,
  onUseThumbnailChange
}) => {
  const platforms = [
    { key: 'instagram', name: 'Instagram 📷', icon: Instagram },
    { key: 'tiktok', name: 'Captions 📝', icon: FileText },
    { key: 'youtube', name: 'Skrypty 💻', icon: Code },
    { key: 'linkedin', name: 'LinkedIn 💼', icon: Linkedin },
    { key: 'x', name: 'X 🐦', icon: Twitter },
    { key: 'facebook', name: 'Facebook 👥', icon: Facebook },
    { key: 'blog', name: 'Blog 📝', icon: FileText }
  ];

  const contentTypeOptions = {
    instagram: ['Post', 'Captions', 'Filmy'],
    // Captions group: choose platforms for captions
    tiktok: ['TikTok', 'Instagram', 'YouTube'],
    // Skrypty group: choose script types
    youtube: ['Haczyki', 'Krótki skrypt', 'Średni skrypt', 'Thumbnail'],
    linkedin: [],
    x: [],
    facebook: [],
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
    
    // Auto-set useThumbnail when YouTube Thumbnail is selected/deselected
    if (platform === 'youtube' && contentType === 'Thumbnail') {
      const isThumbnailSelected = newTypes.includes('Thumbnail');
      onUseThumbnailChange?.(isThumbnailSelected);
    }
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

      {/* Content Type Options - only for Captions (tiktok) and Skrypty (youtube) */}
      {(selectedPlatforms.youtube || selectedPlatforms.tiktok) && (
        <div className="space-y-4">
          {selectedPlatforms.youtube && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje Skrypty:</p>
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

          {selectedPlatforms.tiktok && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Opcje Captions:</p>
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
        </div>
      )}

    </div>
  );
};

export default PlatformMultiSelect;