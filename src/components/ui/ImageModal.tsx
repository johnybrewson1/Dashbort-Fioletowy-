import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt
}) => {
  const handleDownload = async () => {
    try {
      // Metoda 1: Pobierz obraz jako blob
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error('Nie można pobrać obrazu');
      }
      
      const blob = await response.blob();
      
      // Utwórz URL dla blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Utwórz link do pobierania
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Wygeneruj nazwę pliku
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const sanitizedAlt = alt.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'image';
      link.download = `${sanitizedAlt}_${timestamp}.jpg`;
      
      // Dodatkowe atrybuty dla pewności pobierania
      link.style.display = 'none';
      link.setAttribute('download', link.download);
      
      // Dodaj do DOM, kliknij i usuń
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Zwolnij URL blob
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Błąd podczas pobierania obrazu:', error);
      
      // Metoda 2: Fallback - bezpośrednie pobieranie
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        
        // Wygeneruj nazwę pliku
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const sanitizedAlt = alt.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'image';
        link.download = `${sanitizedAlt}_${timestamp}.jpg`;
        
        // Dodatkowe atrybuty dla pewności pobierania
        link.style.display = 'none';
        link.setAttribute('download', link.download);
        
        // Dodaj do DOM, kliknij i usuń
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download też nie zadziałał:', fallbackError);
        
        // Ostatnia opcja - informuj użytkownika
        alert('Nie można pobrać obrazu. Spróbuj kliknąć prawym przyciskiem na obraz i wybierz "Zapisz obraz jako..."');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative">
          {/* Download button */}
          <Button
            variant="ghost"
            onClick={handleDownload}
            className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white flex items-center space-x-2 px-3 py-2"
          >
            <Download className="w-5 h-5" />
            <span>Pobierz</span>
          </Button>

          {/* Image */}
          <div className="flex items-center justify-center min-h-[70vh] p-4">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: 'calc(90vh - 2rem)' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
