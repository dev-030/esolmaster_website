"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2, ZoomIn, ZoomOut, Check } from "lucide-react";

// Point worker to unpkg to avoid Next.js build errors
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Individual Page Component
const PdfPageCanvas = ({ 
  pdfDoc, 
  pageNum, 
  scale, 
  onSnip 
}: { 
  pdfDoc: any; 
  pageNum: number; 
  scale: number; 
  onSnip: (img: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (renderTaskRef.current) {
          try { await renderTaskRef.current.cancel(); } catch(e) {}
        }

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (isMounted) setIsRendered(true);
      } catch (e: any) {
        if (e?.name !== 'RenderingCancelledException') {
          console.error("Render error on page", pageNum, e);
        }
      }
    };
    renderPage();
    return () => { isMounted = false; };
  }, [pdfDoc, pageNum, scale]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const visualX = e.clientX - rect.left;
    const visualY = e.clientY - rect.top;
    setStartPos({ x: visualX, y: visualY });
    setCurrentPos({ x: visualX, y: visualY });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setCurrentPos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    snipRegion();
  };

  const snipRegion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const trueStartX = startPos.x * scaleX;
    const trueStartY = startPos.y * scaleY;
    const trueCurrentX = currentPos.x * scaleX;
    const trueCurrentY = currentPos.y * scaleY;

    const x = Math.min(trueStartX, trueCurrentX);
    const y = Math.min(trueStartY, trueCurrentY);
    const width = Math.abs(trueCurrentX - trueStartX);
    const height = Math.abs(trueCurrentY - trueStartY);

    if (width < 30 || height < 30) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (tempCtx) {
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, width, height);
      tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    }

    const base64 = tempCanvas.toDataURL("image/jpeg", 1.0); // max quality
    onSnip(base64);
    
    setStartPos({x:0, y:0});
    setCurrentPos({x:0, y:0});
  };

  return (
    <div className="relative mb-6 shadow-lg bg-white inline-block">
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
        className="cursor-crosshair max-w-full h-auto block"
      />
      {isDrawing && (
        <div 
          className="absolute border-2 border-indigo-500 bg-indigo-400/20 pointer-events-none"
          style={{
            left: Math.min(startPos.x, currentPos.x),
            top: Math.min(startPos.y, currentPos.y),
            width: Math.abs(currentPos.x - startPos.x),
            height: Math.abs(currentPos.y - startPos.y),
          }}
        />
      )}
      <div className="absolute -left-12 top-4 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow">
        {pageNum}
      </div>
    </div>
  );
};


export default function PdfSnippingTool({ file, onSnip }: { file: File, onSnip: (img: string) => void }) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(2.0); // Default high quality
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (e) {
        console.error("Error loading PDF", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (file) loadPdf();
  }, [file]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1.0));

  return (
    <div className="flex flex-col items-center w-full h-full max-h-full bg-slate-50 overflow-hidden">
      <div className="flex justify-between items-center w-full p-3 bg-white border-b sticky top-0 z-10">
         <h3 className="font-semibold text-slate-700 text-sm">PDF Snipping Tool</h3>
         
         <div className="flex items-center space-x-4">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            <span className="text-xs text-slate-500 font-medium">
              {pdfDoc ? `${pdfDoc.numPages} Pages` : 'Loading...'}
            </span>
            <div className="flex items-center space-x-1 border rounded-lg p-1 bg-slate-50">
              <button 
                onClick={handleZoomOut} 
                disabled={scale <= 1.0}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-50"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button 
                onClick={handleZoomIn} 
                disabled={scale >= 4.0}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded disabled:opacity-50"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
         </div>
      </div>
      
      <div className="w-full text-center py-2 bg-indigo-50 border-b border-indigo-100 z-10">
        <p className="text-xs text-indigo-700 font-semibold">✨ Scroll down to see all pages. Click and drag over any part of the PDF to copy it as an image!</p>
      </div>
      
      <div className="relative w-full flex-1 min-h-0 overflow-auto flex flex-col items-center bg-slate-300 p-8">
        {pdfDoc && Array.from({ length: pdfDoc.numPages }, (_, i) => (
          <PdfPageCanvas 
            key={i + 1} 
            pageNum={i + 1} 
            pdfDoc={pdfDoc} 
            scale={scale} 
            onSnip={onSnip} 
          />
        ))}
      </div>
    </div>
  );
}
