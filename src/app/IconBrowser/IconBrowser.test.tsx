import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IconBrowser } from './IconBrowser';

const pngMocks = vi.hoisted(() => ({
  svgStringToPng512: vi.fn(),
  triggerBlobDownload: vi.fn(),
}));

vi.mock('./svgToPng512', () => ({
  svgStringToPng512: pngMocks.svgStringToPng512,
  triggerBlobDownload: pngMocks.triggerBlobDownload,
}));

vi.mock('./RhIconPreview', () => ({
  RhIconPreview: () => <span data-testid="rh-icon-mock" />,
}));

vi.mock('@rhds/icons/metadata.js', () => ({
  icons: new Map([
    // Use real icon slugs so dynamic `@rhds/icons/standard/*.js` imports resolve in tests.
    ['standard', new Set(['wifi', 'wrench', 'yes'])],
    ['ui', new Set(['warning'])],
    ['microns', new Set([])],
    ['social', new Set([])],
  ]),
}));

vi.mock('./iconAliases.json', () => ({
  default: {
    standard: {
      wifi: ['wireless'],
    },
  },
}));

beforeEach(() => {
  pngMocks.svgStringToPng512.mockReset();
  pngMocks.svgStringToPng512.mockResolvedValue(new Blob(['x'], { type: 'image/png' }));
  pngMocks.triggerBlobDownload.mockReset();
});

function StandardSectionHarness() {
  const [searchQuery, setSearchQuery] = React.useState('');
  return (
    <MemoryRouter>
      <IconBrowser
        activeSection="standard"
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        iconSizePx={32}
        isThemeDark={false}
      />
    </MemoryRouter>
  );
}

/** Lazy `IconBrowserSetView` + virtual grid need async resolution after render. */
async function expectStandardGridReady(): Promise<void> {
  await screen.findByPlaceholderText(/Search/i);
}

describe('IconBrowser', () => {
  it('filters icons when search query changes', async () => {
    const user = userEvent.setup();
    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    expect(screen.getByRole('button', { name: /wifi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wrench/i })).toBeInTheDocument();

    const search = screen.getByPlaceholderText(/Search/i);
    await user.type(search, 'wrench');

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /wifi/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /wrench/i })).toBeInTheDocument();
  });

  it('filters icons by alias from iconAliases.json', async () => {
    const user = userEvent.setup();
    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    const search = screen.getByPlaceholderText(/Search/i);
    await user.type(search, 'wireless');

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /wrench/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /wifi/i })).toBeInTheDocument();
  });

  it('opens drawer and copies minimal markup from panel', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    await user.click(screen.getByRole('button', { name: /wifi/i }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'wifi' })).toBeInTheDocument();

    const copyButtons = within(dialog).getAllByRole('button', { name: /^Copy$/i });
    await user.click(copyButtons[0]);

    expect(writeText).toHaveBeenCalled();
    expect(String(writeText.mock.calls[0][0])).toContain('rh-icon');
    expect(String(writeText.mock.calls[0][0])).toContain('wifi');
  });

  it('downloads PNG from drawer when SVG is ready', async () => {
    const user = userEvent.setup();
    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    await user.click(screen.getByRole('button', { name: /wifi/i }));

    const dialog = screen.getByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByRole('button', { name: 'Copy SVG' })).toBeEnabled();
    });

    await user.click(within(dialog).getByRole('button', { name: /Download PNG/i }));

    await waitFor(() => {
      expect(pngMocks.svgStringToPng512).toHaveBeenCalledTimes(1);
    });
    const svgArg = String(pngMocks.svgStringToPng512.mock.calls[0][0]);
    expect(svgArg).toContain('<svg');
    expect(svgArg).toMatch(/viewBox/i);

    expect(pngMocks.triggerBlobDownload).toHaveBeenCalledTimes(1);
    expect(pngMocks.triggerBlobDownload.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(pngMocks.triggerBlobDownload.mock.calls[0][1]).toBe('standard-wifi.png');
  });

  it('copies PNG data URL from drawer when SVG is ready', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    await user.click(screen.getByRole('button', { name: /wifi/i }));

    const dialog = screen.getByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByRole('button', { name: 'Copy SVG' })).toBeEnabled();
    });

    await user.click(within(dialog).getByRole('button', { name: /Copy data URL \(PNG\)/i }));

    await waitFor(() => {
      expect(pngMocks.svgStringToPng512).toHaveBeenCalledTimes(1);
    });
    expect(pngMocks.triggerBlobDownload).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const copied = String(writeText.mock.calls[0][0]);
    expect(copied).toMatch(/^data:image\/png;base64,/);
  });

  it('downloads SVG file from drawer when ready', async () => {
    const user = userEvent.setup();
    render(<StandardSectionHarness />);
    await expectStandardGridReady();

    await user.click(screen.getByRole('button', { name: /wifi/i }));

    const dialog = screen.getByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByRole('button', { name: 'Copy SVG' })).toBeEnabled();
    });

    await user.click(within(dialog).getByRole('button', { name: /Download SVG/i }));

    expect(pngMocks.triggerBlobDownload).toHaveBeenCalledTimes(1);
    const [blob, filename] = pngMocks.triggerBlobDownload.mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe('image/svg+xml');
    expect(filename).toBe('standard-wifi.svg');
  });
});
