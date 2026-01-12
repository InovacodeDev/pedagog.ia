'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamViewerProps {
  imageUrl: string;
}

export function ExamViewer({ imageUrl }: ExamViewerProps) {
  return (
    <div className="h-full w-full bg-muted/30 border rounded-lg overflow-hidden relative flex flex-col">
      <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => zoomIn()} aria-label="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomOut()} aria-label="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => resetTransform()} aria-label="Reset Zoom">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <div className="w-full h-full flex items-center justify-center p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Exam Page"
                  className="max-w-full max-h-full object-contain shadow-lg"
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
