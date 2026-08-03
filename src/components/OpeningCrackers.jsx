import { useEffect } from 'react';
import { playCrackerBurst } from '../lib/crackerBurst';

export default function OpeningCrackers() {
  useEffect(() => {
    const id = window.setTimeout(playCrackerBurst, 400);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
