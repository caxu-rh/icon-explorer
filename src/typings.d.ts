export {};

declare global {
  /** Set at build time in webpack.common.js (DefinePlugin); mirrored in vitest.config.ts for tests. */
  // eslint-disable-next-line no-var
  var __ROUTER_BASENAME__: string;
  namespace JSX {
    interface IntrinsicElements {
      'rh-icon': import('react').DetailedHTMLProps<import('react').HTMLAttributes<HTMLElement>, HTMLElement> & {
        set?: string;
        icon?: string;
        loading?: 'lazy' | 'idle' | 'eager';
      };
    }
  }
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.css';
declare module '*.wav';
declare module '*.mp3';
declare module '*.m4a';
declare module '*.rdf';
declare module '*.ttl';
declare module '*.pdf';
