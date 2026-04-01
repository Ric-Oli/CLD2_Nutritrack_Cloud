export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getImageUrl(image) {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${API_URL}/uploads/foods/${image}`;
}