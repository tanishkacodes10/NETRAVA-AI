
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App.jsx';
import Admin from './Admin.jsx';
import Landing from './Landing.jsx';
import Auth from './Auth.jsx';
import Dashboard from './Dashboard.jsx';

import { getUser } from './auth';

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();

  return hash || (getUser() ? 'dashboard' : 'login');
}

function Root() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    function onHashChange() {
      setRoute(getRoute());
      window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const user = getUser();

  if (route === 'signup') {
    return <Auth key="signup" mode="signup" />;
  }

  if (route === 'login') {
    return <Auth key="login" mode="login" />;
  }

  if (!user && ['dashboard', 'exam', 'admin'].includes(route)) {
    return <Auth key="login" mode="login" />;
  }

  if (route === 'admin') {
    return (
      <div className="wrap" style={{ paddingTop: 24 }}>
        <Admin />
      </div>
    );
  }

  if (route === 'dashboard') {
    return <Dashboard />;
  }

  if (route === 'exam') {
    return (
      <div className="narrow">
        <App />
      </div>
    );
  }

  return <Landing />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
