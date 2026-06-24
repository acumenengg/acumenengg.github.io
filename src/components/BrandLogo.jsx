import { useTheme } from '../hooks/useTheme';
import { getLogo } from '../data/branding';

export default function BrandLogo({ variant = 'horizontal', className = '', alt = 'Acumen Engineering Services' }) {
  const { theme } = useTheme();
  const src = getLogo(variant, theme);

  return <img src={src} alt={alt} className={className} />;
}
