import * as React from 'react';
import App from '@app/index';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, test, vi } from 'vitest';

vi.mock('../rhds/registerRhIcon', () => ({
  registerRhIcon: async () => undefined,
}));

describe('App tests', () => {
  test('should render default App component', () => {
    const { asFragment } = render(<App />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a nav-toggle button', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Global navigation' })).toBeVisible();
  });

  it('should render Overview navigation', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
  });

  it('should render masthead color theme switcher', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /color theme:/i })).toBeVisible();
  });

  it('should expand the sidebar on larger viewports', () => {
    render(<App />);

    window.dispatchEvent(new Event('resize'));

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
  });

  it('should hide the sidebar when clicking the nav-toggle button', async () => {
    const user = userEvent.setup();

    render(<App />);

    window.dispatchEvent(new Event('resize'));
    const button = screen.getByRole('button', { name: 'Global navigation' });

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible();

    await user.click(button);

    expect(screen.queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument();
  });
});
