import { useState } from 'react';
import { signup, login, go } from './auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth({ mode = 'login' }) {
  const [isSignup, setIsSignup] = useState(mode === 'signup');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setError('');
  }

  function submit(e) {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (isSignup && !name) {
      setError('Please enter your full name.');
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = isSignup
        ? signup({ name, email, password })
        : login({ email, password });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.user) {
        go('dashboard');
      } else {
        setError('Unable to log in. Please try again.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsSignup((prev) => !prev);
    setError('');
    setForm({
      name: '',
      email: '',
      password: ''
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">N</span>
          <span>Netrava</span>
        </div>

        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>

        <p className="auth-subtitle">
          {isSignup
            ? 'Create an account to get started.'
            : 'Log in to continue to your exam dashboard.'}
        </p>

        <form onSubmit={submit}>
          {isSignup && (
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete={
                isSignup ? 'new-password' : 'current-password'
              }
              minLength={isSignup ? 6 : undefined}
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Log In'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup
            ? 'Already have an account? '
            : "Don't have an account? "}

          <button type="button" onClick={switchMode}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </section>
    </main>
  );
}