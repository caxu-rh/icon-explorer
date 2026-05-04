import { afterEach, describe, expect, it, vi } from 'vitest';
import { triggerBlobDownload } from './svgToPng512';

describe('triggerBlobDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an object URL, appends an anchor, clicks it, removes it, and revokes the URL', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:unit-test');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const blob = new Blob(['x'], { type: 'image/png' });
    triggerBlobDownload(blob, 'icon.png');

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.tagName).toBe('A');
    expect(anchor.download).toBe('icon.png');
    expect(anchor.rel).toBe('noopener');
    expect(anchor.href).toContain('blob:unit-test');
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:unit-test');
  });
});
