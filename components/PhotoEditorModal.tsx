import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface PhotoEditorModalProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
}

const CROP_AREA_SIZE = 256;
const OUTPUT_IMAGE_SIZE = 300; // A bit higher res for quality

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({ imageSrc, onSave, onCancel }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [minZoom, setMinZoom] = useState(1);

  const resetState = useCallback(() => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    
    const { naturalWidth, naturalHeight } = img;
    // Fit image to cover the crop area
    const scale = Math.max(CROP_AREA_SIZE / naturalWidth, CROP_AREA_SIZE / naturalHeight);
    
    setZoom(scale);
    setMinZoom(scale);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Use an effect to reset state when the image source changes.
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = resetState;
  }, [imageSrc, resetState]);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };
  
  const handleDragMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = OUTPUT_IMAGE_SIZE;
    canvas.height = OUTPUT_IMAGE_SIZE;

    const centerX = OUTPUT_IMAGE_SIZE / 2;
    const centerY = OUTPUT_IMAGE_SIZE / 2;
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(centerX, centerY, OUTPUT_IMAGE_SIZE / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    
    // Calculate the drawing parameters to match the preview
    const previewToCanvasScale = OUTPUT_IMAGE_SIZE / CROP_AREA_SIZE;
    
    const drawWidth = image.naturalWidth * zoom * previewToCanvasScale;
    const drawHeight = image.naturalHeight * zoom * previewToCanvasScale;
    
    // Center the image, then apply the user's pan offset
    const drawX = centerX - drawWidth / 2 + offset.x * previewToCanvasScale;
    const drawY = centerY - drawHeight / 2 + offset.y * previewToCanvasScale;
    
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImageUrl);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 animate-fadeIn" onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
        <div className="w-full max-w-sm bg-[#F5F5F5] dark:bg-[#1E1E1E] rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">{t('profile.photo.editTitle')}</h3>
            <div
              className="relative bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden cursor-move mb-4"
              style={{ width: CROP_AREA_SIZE, height: CROP_AREA_SIZE }}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt={t('profile.photo.preview')}
                crossOrigin="anonymous"
                className="absolute"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  top: '50%',
                  left: '50%',
                  pointerEvents: 'none',
                }}
                onLoad={resetState}
              />
            </div>

            <div className="w-full max-w-xs mb-6 flex items-center gap-3">
                <span className="text-lg font-bold text-black dark:text-white">－</span>
                <input
                    id="zoom"
                    type="range"
                    min={minZoom}
                    max={minZoom + 2}
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    aria-label={t('profile.photo.zoom')}
                />
                 <span className="text-lg font-bold text-black dark:text-white">＋</span>
            </div>

            <div className="flex w-full justify-around">
                <button 
                  onClick={onCancel}
                  className="px-8 py-2 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-500 transition-transform active:scale-95"
                >
                  {t('profile.photo.cancel')}
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-2 bg-primary text-white rounded-full font-semibold hover:brightness-110 transition-transform active:scale-95"
                >
                  {t('profile.photo.save')}
                </button>
            </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
