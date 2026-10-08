import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RobotRoom = React.lazy(() => import('./components/avatar/RobotRoom'));
const AvatarDemo = React.lazy(() => import('./components/avatar/AvatarDemo'));
const currentRoute = () => window.location.hash.replace(/^#\/?/, '');

/** Kiwi is the entire app. Retired links such as #app open the robot too. */
export default function App() {
  const { t } = useTranslation();
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return (
    <Suspense fallback={<div role="status" className="p-6 text-center">{t('app.loading')}</div>}>
      {route === 'avatar' ? <AvatarDemo /> : <RobotRoom key={route} />}
    </Suspense>
  );
}
