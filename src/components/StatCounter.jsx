import { useCounterAnimation } from '../hooks/useScrollAnimations';
import './StatCounter.css';

export default function StatCounter({ value, suffix, label }) {
  const ref = useCounterAnimation(value);

  return (
    <div className="stat-counter">
      <div className="stat-counter__value">
        <span ref={ref}>0</span>
        <span className="stat-counter__suffix">{suffix}</span>
      </div>
      <div className="stat-counter__label">{label}</div>
    </div>
  );
}
