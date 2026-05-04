import { svgStringToPng512, triggerBlobDownload } from './svgToPng512';

export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Could not encode PNG as data URL.'));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Could not read PNG.'));
    };
    reader.readAsDataURL(blob);
  });
}

export function pngExportErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Could not generate PNG.';
}

export type PngDrawerExportMode = 'copyDataUrl' | 'download';

export async function runPng512Export(
  drawerRasterSvgString: string,
  mode: PngDrawerExportMode,
  pngFilename: string,
): Promise<void> {
  const blob = await svgStringToPng512(drawerRasterSvgString);
  if (mode === 'copyDataUrl') {
    const dataUrl = await readBlobAsDataUrl(blob);
    await navigator.clipboard.writeText(dataUrl);
    return;
  }
  triggerBlobDownload(blob, pngFilename);
}
