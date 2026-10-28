import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const NotFoundPage = () => {
  return (
    <PageContainer>
      <div className="py-20 text-center max-w-md mx-auto">
        <span className="editorial-heading text-6xl text-forest font-semibold block mb-2">404</span>
        <h1 className="text-xl font-bold text-ink mb-2">Page Not Found</h1>
        <p className="text-xs text-olive leading-relaxed mb-6">
          The requested page or route does not exist in the current application tree.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    </PageContainer>
  );
};

export default NotFoundPage;
