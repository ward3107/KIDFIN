
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { runSchemaMigration } from './utils/storage';
import './i18n';

runSchemaMigration();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Lazy-load the 3D avatar demo so three.js is only fetched when actually opened
// (visit "…/#avatar"). Keeps the main app bundle light.
const AvatarDemo = React.lazy(() => import('./components/avatar/AvatarDemo'));

const isAvatarRoute = () =>
  typeof window !== 'undefined' && window.location.hash.replace(/^#\/?/, '') === 'avatar';

const Root: React.FC = () => {
  const [avatarRoute, setAvatarRoute] = React.useState(isAvatarRoute());
  React.useEffect(() => {
    const onHash = () => setAvatarRoute(isAvatarRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (avatarRoute) {
    return (
      <Suspense fallback={<div style={{ padding: 24 }}>טוען את הרובוט… 🤖</div>}>
        <AvatarDemo />
      </Suspense>
    );
  }
  return <App />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
