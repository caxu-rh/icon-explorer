import * as React from 'react';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <PageSection hasBodyWrapper={false}>
      <EmptyState titleText="404 Page not found" variant="full" icon={ExclamationTriangleIcon}>
        <EmptyStateBody>
          We didn&apos;t find a page that matches the address you navigated to.
        </EmptyStateBody>
        <EmptyStateFooter>
          <Button onClick={() => navigate('/')}>Take me home</Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export { NotFound };
