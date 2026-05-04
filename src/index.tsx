import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@app/index';
import { registerRhIcon } from './rhds/registerRhIcon';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000);
}

const root = ReactDOM.createRoot(document.getElementById('root') as Element);

void registerRhIcon().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
