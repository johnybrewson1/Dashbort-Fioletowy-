import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MagicContentInputProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'magic' | 'ranking';
}

const MagicContentInput: React.FC<MagicContentInputProps> = ({ value, onChange, variant = 'magic' }) => {
  const getPlaceholder = () => {
    if (variant === 'ranking') {
      return "Wpisz dodatkowe wytyczne dla generowania treści...";
    }
    
    return "📝 Wklej treść artykułu, który chcesz przekształcić w post\n💡 Napisz swoją myśl lub pomysł na content\n🔗 Udostępnij URL artykułu, Thumbnail lub posta\n📱 Opisz swój cel - jaki typ treści chcesz stworzyć\n🎯 Dodaj kontekst - dla kogo, w jakim stylu, na jaką platformę";
  };

  return (
    <div className="space-y-4 mb-8">
      <Label htmlFor="content" className="text-2xl font-bold text-foreground">
        {variant === 'ranking' ? 'Dodatkowe wytyczne' : 'Wrzuć tutaj cokolwiek'}
      </Label>
      <Textarea
        id="content"
        placeholder={getPlaceholder()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field text-lg p-6 min-h-32 resize-none border-2 hover:border-primary/50 focus:border-primary transition-all duration-300"
        rows={8}
      />
    </div>
  );
};

export default MagicContentInput;