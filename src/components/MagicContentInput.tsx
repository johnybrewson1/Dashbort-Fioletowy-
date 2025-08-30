import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MagicContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MagicContentInput: React.FC<MagicContentInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4 mb-8">
      <Label htmlFor="content" className="text-2xl font-bold text-foreground">
        Wrzuć tutaj cokolwiek
      </Label>
      <Textarea
        id="content"
        placeholder="Wklej artykuł, napisz myśl, udostępnij przykładowy URL lub cokolwiek co zainspiruje Twój następny wirusowy post!"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field text-lg p-6 min-h-32 resize-none border-2 hover:border-primary/50 focus:border-primary transition-all duration-300"
        rows={8}
      />
    </div>
  );
};

export default MagicContentInput;