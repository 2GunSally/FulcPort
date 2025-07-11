import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
  onView: (imageUrl: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove, onView }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <img
              src={imageUrl}
              alt={`Preview ${index + 1}`}
              className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onView(imageUrl)}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;