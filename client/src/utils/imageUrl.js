/**
 * Formats image URLs so that uploaded images (/uploads/...) and external images
 * always load properly across ports and hosts.
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

/**
 * Robust image error handler that attempts direct backend fallback
 * before falling back to default placeholder.
 */
export const handleImageError = (
  e,
  originalUrl,
  fallback = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
) => {
  if (!e || !e.target) return;
  
  // If it's an uploaded file and hasn't attempted the direct server port fallback, try port 5000
  if (
    !e.target.dataset.triedDirect &&
    originalUrl &&
    (originalUrl.includes('uploads/') || originalUrl.includes('/uploads/'))
  ) {
    e.target.dataset.triedDirect = 'true';
    const cleanPath = originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`;
    e.target.src = `http://localhost:5000${cleanPath}`;
    return;
  }

  // Prevent infinite loops on broken fallbacks
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
};

export default getImageUrl;

