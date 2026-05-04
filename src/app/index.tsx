import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@rhds/tokens/css/global.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { IconApp } from '@app/IconApp/IconApp';
import '@app/app.css';

const App: React.FunctionComponent = () => (
  <Router basename={__ROUTER_BASENAME__ || undefined}>
    <Routes>
      <Route path="/*" element={<IconApp />} />
    </Routes>
  </Router>
);

export default App;
