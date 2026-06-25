const base = import.meta.env.BASE_URL;
const folder = "Gellery";

const filenames = [
  "PHOTO-2026-06-24-23-12-02.jpg",
  "PHOTO-2026-06-24-23-12-03.jpg",
  "PHOTO-2026-06-24-23-12-11.jpg",
  "PHOTO-2026-06-24-23-12-14 2.jpg",
  "PHOTO-2026-06-24-23-12-14.jpg",
  "PHOTO-2026-06-24-23-12-15 2.jpg",
  "PHOTO-2026-06-24-23-12-15.jpg",
  "PHOTO-2026-06-24-23-12-16.jpg",
  "PHOTO-2026-06-24-23-12-17.jpg",
  "PHOTO-2026-06-24-23-12-18 2.jpg",
  "PHOTO-2026-06-24-23-12-18.jpg",
  "PHOTO-2026-06-24-23-12-19.jpg",
  "PHOTO-2026-06-24-23-12-20.jpg",
  "PHOTO-2026-06-24-23-12-22.jpg",
  "PHOTO-2026-06-24-23-12-23 2.jpg",
  "PHOTO-2026-06-24-23-12-23.jpg",
  "PHOTO-2026-06-24-23-12-24 2.jpg",
  "PHOTO-2026-06-24-23-12-24.jpg",
  "PHOTO-2026-06-24-23-12-25.jpg",
  "PHOTO-2026-06-24-23-12-26.jpg",
  "PHOTO-2026-06-24-23-12-27 2.jpg",
  "PHOTO-2026-06-24-23-12-27.jpg",
  "PHOTO-2026-06-24-23-12-28 2.jpg",
  "PHOTO-2026-06-24-23-12-28.jpg",
  "PHOTO-2026-06-24-23-12-29 2.jpg",
  "PHOTO-2026-06-24-23-12-29.jpg",
  "PHOTO-2026-06-24-23-12-30 2.jpg",
  "PHOTO-2026-06-24-23-12-30.jpg",
  "PHOTO-2026-06-24-23-12-31 2.jpg",
  "PHOTO-2026-06-24-23-12-31.jpg",
  "PHOTO-2026-06-24-23-12-33.jpg",
  "PHOTO-2026-06-24-23-12-34 2.jpg",
  "PHOTO-2026-06-24-23-12-34.jpg",
  "PHOTO-2026-06-24-23-12-35.jpg",
  "PHOTO-2026-06-24-23-12-36 2.jpg",
  "PHOTO-2026-06-24-23-12-36.jpg",
  "PHOTO-2026-06-24-23-12-37.jpg",
  "PHOTO-2026-06-24-23-12-38.jpg",
  "PHOTO-2026-06-24-23-17-08.jpg",
  "PHOTO-2026-06-24-23-17-09 2.jpg",
  "PHOTO-2026-06-24-23-17-09 3.jpg",
  "PHOTO-2026-06-24-23-17-09.jpg",
  "PHOTO-2026-06-24-23-17-10.jpg",
  "PHOTO-2026-06-24-23-17-11 2.jpg",
  "PHOTO-2026-06-24-23-17-11.jpg"
];

export const galleryImages = filenames.map((name, index) => ({
  id: index + 1,
  src: `${base}${folder}/${encodeURIComponent(name)}`,
  alt: `Acumen Engineering project ${index + 1}`,
}));

export const galleryCount = galleryImages.length;
