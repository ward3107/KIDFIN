
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
// Full-screen, distraction-free robot room (visit "…/#robot").
const RobotRoom = React.lazy(() => import('./components/avatar/RobotRoom'));

const currentRoute = () =>
  typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : '';

const Root: React.FC = () => {
  const [route, setRoute] = React.useState(currentRoute());
  React.useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const fallback = <div style={{ padding: 24 }}>טוען את הרובוט… 🤖</div>;

  // The full KIDFIN app now lives behind "#app" (teachers reach it via the
  // small gear in the robot room). Everything else opens straight to the robot.
  if (route === 'app') {
    return <App />;
  }
  if (route === 'avatar') {
    return (
      <Suspense fallback={fallback}>
        <AvatarDemo />
      </Suspense>
    );
  }
  // Default (and legacy "#robot"): the robot is the front door.
  return (
    <Suspense fallback={fallback}>
      <RobotRoom />
    </Suspense>
  );
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
