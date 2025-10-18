import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  progress?: number; // 0-100
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = "Generowanie treści...",
  description = "Proszę czekać, trwa przetwarzanie Twojego żądania.",
  progress
}) => {
  console.log('🔄 LoadingModal render:', { isOpen, title, description, timestamp: new Date().toISOString() });
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md text-center [&>button]:hidden z-[9999]">
        <div className="flex flex-col items-center space-y-4 py-6">
          {/* Spinning loader */}
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-primary/20 animate-pulse"></div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {description}
            </p>
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Postęp</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
