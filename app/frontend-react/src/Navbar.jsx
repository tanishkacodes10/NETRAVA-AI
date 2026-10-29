
import { getUser, logout, go } from './auth';
import './index.css';

export default function Navbar() {
  const user = getUser();

  function handleLogout() {
    logout();
    go('login');
  }

  return (
    <header className="nav-bar">
      <div className="nav-in">
        <button
          type="button"
          className="nav-brand"
          onClick={() => go(user ? 'dashboard' : 'home')}
          aria-label="NETRAVA home"
        >
          <span className="nav-brand-icon">
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>

          <span className="nav-brand-text">
            NETRAVA <span>AI</span>
            <small>SECURE ASSESSMENT PLATFORM</small>
          </span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <button
                type="button"
                className="nav-dashboard"
                onClick={() => go('dashboard')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Dashboard
              </button>

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-login"
                onClick={() => go('login')}
              >
                Log in
              </button>

              <button
                type="button"
                className="nav-get-started"
                onClick={() => go('signup')}
              >
                Get Started <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
