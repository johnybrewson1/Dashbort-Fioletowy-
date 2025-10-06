import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instructions: string) => void;
  title: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "Wprowadź instrukcje...",
  value,
  onValueChange
}) => {
  const [internalInstructions, setInternalInstructions] = useState('');
  
  const instructions = value !== undefined ? value : internalInstructions;
  const setInstructions = onValueChange || setInternalInstructions;

  const handleSubmit = () => {
    onSubmit(instructions);
    if (value === undefined) {
      setInternalInstructions('');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Instrukcje:
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={placeholder}
              className="min-h-32"
              rows={8}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button onClick={handleSubmit}>
              Wyślij
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
