const base = import.meta.env.BASE_URL;

export const logos = {
  horizontal: {
    dark: `${base}logo-dark.png`,
    light: `${base}logo-light.png`,
  },
  stacked: {
    dark: `${base}logo-stacked-dark.png`,
    light: `${base}logo-stacked-light.png`,
  },
};

export function getLogo(variant, theme) {
  return logos[variant][theme === 'light' ? 'light' : 'dark'];
}
