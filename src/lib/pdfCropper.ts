/**
 * Client-Side PDF Context Cropping Utility
 * Renders a PDF page to an offscreen Canvas and extracts the normalized bounding box.
 */

export interface CropRegion {
  page: number;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
}

/**
 * Crops a specific region from a PDF file in the browser using HTML5 Canvas.
 * @param file The uploaded PDF File object
 * @param region Normalized bounding box coordinates (0.0 - 1.0 or 0 - 1000 box_2d)
 * @param scale Quality scale factor (default 2.5 for crisp text)
 * @returns Base64 image data URL (data:image/png;base64,...)
 */
export async function cropPdfContext(
  file: File | ArrayBuffer,
  region: CropRegion,
  scale: number = 2.5
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('cropPdfContext can only be called in browser environment');
  }

  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  // Get ArrayBuffer
  const buffer = file instanceof File ? await file.arrayBuffer() : file;

  // Load document
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageNum = Math.max(1, Math.min(region.page || 1, pdf.numPages));
  const page = await pdf.getPage(pageNum);

  const viewport = page.getViewport({ scale });

  // 1. Render the full page to an offscreen canvas
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = viewport.width;
  fullCanvas.height = viewport.height;
  const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });

  if (!fullCtx) {
    throw new Error('Failed to get 2D canvas context');
  }

  await (page.render as any)({
    canvasContext: fullCtx,
    viewport: viewport,
    canvas: fullCanvas,
  }).promise;

  // 2. Parse normalized coordinates (0.0 to 1.0)
  let left = typeof region.left === 'number' ? region.left : 0;
  let top = typeof region.top === 'number' ? region.top : 0;
  let width = typeof region.width === 'number' ? region.width : 1;
  let height = typeof region.height === 'number' ? region.height : 1;

  // Handle box_2d: [ymin, xmin, ymax, xmax] scaled 0 to 1000
  if (Array.isArray(region.box_2d) && region.box_2d.length === 4) {
    const [ymin, xmin, ymax, xmax] = region.box_2d;
    top = ymin / 1000;
    left = xmin / 1000;
    height = (ymax - ymin) / 1000;
    width = (xmax - xmin) / 1000;
  } else if (typeof region.right === 'number' && typeof region.bottom === 'number') {
    width = region.right - left;
    height = region.bottom - top;
  }

  // Add gentle 1% breathing room so outer decorative border lines are never clipped
  const padX = width * 0.01;
  const padY = height * 0.01;

  left = Math.max(0, Math.min(left - padX, 1));
  top = Math.max(0, Math.min(top - padY, 1));
  width = Math.max(0.01, Math.min(width + padX * 2, 1 - left));
  height = Math.max(0.01, Math.min(height + padY * 2, 1 - top));

  // Pixel coordinates on the rendered canvas
  const pixelX = Math.round(left * fullCanvas.width);
  const pixelY = Math.round(top * fullCanvas.height);
  const pixelW = Math.round(width * fullCanvas.width);
  const pixelH = Math.round(height * fullCanvas.height);

  // 3. Create cropped canvas
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = pixelW;
  cropCanvas.height = pixelH;
  const cropCtx = cropCanvas.getContext('2d');

  if (!cropCtx) {
    throw new Error('Failed to get crop canvas context');
  }

  cropCtx.drawImage(
    fullCanvas,
    pixelX, pixelY, pixelW, pixelH, // source rectangle
    0, 0, pixelW, pixelH            // destination rectangle
  );

  // 4. Return clean Base64 data URL
  const dataUrl = cropCanvas.toDataURL('image/png');

  // 5. Memory Cleanup
  fullCanvas.width = 0;
  fullCanvas.height = 0;
  cropCanvas.width = 0;
  cropCanvas.height = 0;

  return dataUrl;
}
