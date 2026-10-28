/**
 * Formats image URLs so that uploaded images (/uploads/...) and external images
 * always load properly.
 */
export const getImageUrl = (url, fallback = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80') => {
  if (!url || typeof url !== 'string') return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it's a relative uploads path, ensure clean path without double slashes
  if (url.startsWith('/uploads')) {
    return url;
  }
  if (url.startsWith('uploads/')) {
    return `/${url}`;
  }
  return url;
};

export default getImageUrl;
