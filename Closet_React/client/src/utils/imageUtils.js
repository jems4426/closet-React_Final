export const getImageUrl = (imagePath, fallbackUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg') => {
  if (!imagePath) return fallbackUrl;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `http://localhost:4000${imagePath}`;
  return fallbackUrl;
};