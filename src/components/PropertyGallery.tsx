import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Nenhuma imagem disponível</span>
      </div>
    );
  }

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setIsOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: "A imagem está sendo baixada.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Confira esta imagem de ${title}`,
          url: images[currentIndex],
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(images[currentIndex]);
        toast({
          title: "Link copiado!",
          description: "O link da imagem foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.slice(0, 6).map((image, index) => (
          <div key={index} className="relative group cursor-pointer">
            <img
              src={image}
              alt={`${title} - Imagem ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
              onClick={() => openGallery(index)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {index === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{images.length - 6}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black border-0">
          <DialogTitle className="sr-only">Galeria de Imagens - {title}</DialogTitle>
          
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
            <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
              <span className="text-white text-sm">
                {currentIndex + 1} de {images.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <Download className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={handleShare}
                className="bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <Share2 className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </Button>
            </>
          )}

          {/* Main Image */}
          <div className="flex items-center justify-center h-full overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`${title} - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="flex gap-2 bg-black bg-opacity-50 rounded-lg p-2 max-w-md overflow-x-auto">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-12 h-12 object-cover rounded cursor-pointer transition-all ${
                      index === currentIndex 
                        ? 'ring-2 ring-white' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};