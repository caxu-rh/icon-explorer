import { svgToUtf8DataUrl } from './iconSvg';

const OUT_PX = 512;

function parseViewBox(svg: string): { minX: number; minY: number; w: number; h: number } | null {
  const m = svg.match(/\bviewBox\s*=\s*"([^"]+)"/i) ?? svg.match(/\bviewBox\s*=\s*'([^']+)'/i);
  if (!m) {
    return null;
  }
  const parts = m[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n)) || parts[2] <= 0 || parts[3] <= 0) {
    return null;
  }
  return { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] };
}

function loadSvgAsImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG as image.'));
    img.src = dataUrl;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not encode PNG.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Rasterizes SVG markup to a 512×512 PNG with a transparent background.
 * The graphic is uniformly scaled to fit inside the square and centered (letterboxed).
 */
export async function svgStringToPng512(svgString: string): Promise<Blob> {
  const trimmed = svgString.trim();
  if (!trimmed.toLowerCase().includes('<svg')) {
    throw new Error('Invalid SVG string.');
  }

  const vb = parseViewBox(trimmed);
  const dataUrl = svgToUtf8DataUrl(trimmed);
  const img = await loadSvgAsImage(dataUrl);

  const srcW = vb && vb.w > 0 ? vb.w : img.naturalWidth || 1;
  const srcH = vb && vb.h > 0 ? vb.h : img.naturalHeight || 1;

  const scale = Math.min(OUT_PX / srcW, OUT_PX / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  const ox = (OUT_PX - dw) / 2;
  const oy = (OUT_PX - dh) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = OUT_PX;
  canvas.height = OUT_PX;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  ctx.clearRect(0, 0, OUT_PX, OUT_PX);
  ctx.drawImage(img, ox, oy, dw, dh);

  return canvasToPngBlob(canvas);
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.requestAnimationFrame(() => URL.revokeObjectURL(url));
}
