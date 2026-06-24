import { lazy, Suspense } from 'react';

const Scene3D = lazy(() => import('./three/Scene3D'));

function SceneLoader() {
  return (
    <div className="scene-loader">
      <div className="scene-loader__spinner" />
    </div>
  );
}

export default function LazyScene3D(props) {
  return (
    <Suspense fallback={<SceneLoader />}>
      <Scene3D {...props} />
    </Suspense>
  );
}
