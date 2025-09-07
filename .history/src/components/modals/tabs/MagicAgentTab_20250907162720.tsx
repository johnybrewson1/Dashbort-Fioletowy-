import React from 'react';
import MagicContentInput from '@/components/MagicContentInput';
import PlatformMultiSelect from '@/components/PlatformMultiSelect';
import MagicButton from '@/components/MagicButton';
import { useMagicAgent } from '@/hooks/useMagicAgent';
interface MagicAgentTabProps {
  onClose: () => void;
}
export const MagicAgentTab: React.FC<MagicAgentTabProps> = ({
  onClose
}) => {
  const {
    content,
    setContent,
    selectedPlatforms,
    selectedContentTypes,
    imageUrl,
    setImageUrl,
    blogPurpose,
    setBlogPurpose,
    loading,
    handleContentTypeChange,
    handlePlatformChange,
    handleSubmit: originalHandleSubmit
  } = useMagicAgent();
  const handleSubmit = async () => {
    const success = await originalHandleSubmit();
    if (success) {
      onClose();
    }
  };
  return <div className="space-y-6">
      {/* Title and Subtitle */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Agent Social Media Resarch </h2>
        <p className="text-lg text-muted-foreground">
          Wrzuć dowolny tekst11111111 i stwórz wirusowe posty na wybraną platformę 🔥
        </p>
      </div>

      <MagicContentInput value={content} onChange={setContent} />
      
      <PlatformMultiSelect 
        selectedPlatforms={selectedPlatforms} 
        selectedContentTypes={selectedContentTypes} 
        onPlatformChange={handlePlatformChange} 
        onContentTypeChange={handleContentTypeChange} 
        imageUrl={imageUrl} 
        onImageUrlChange={setImageUrl}
        blogPurpose={blogPurpose}
        onBlogPurposeChange={setBlogPurpose}
      />
      
      <MagicButton onClick={handleSubmit} loading={loading} />
    </div>;
};