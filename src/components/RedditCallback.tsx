import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedditCallback: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Since we're using password grant flow, we don't need this component anymore
    navigate('/');
  }, [navigate]);

  return null;
};

export default RedditCallback;