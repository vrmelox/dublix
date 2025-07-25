// utils/imageUtils.ts
export const getImageUrl = (imagePath: string): string => {
  // Si le chemin commence déjà par http, le retourner tel quel
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Enlever le "/" au début si présent
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Utiliser la base URL sans /api pour les uploads
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://bioqrsuivi.com';
  
  return `${baseUrl}/${cleanPath}`;
};

export const getQRCodeUrl = (qrPath: string): string => {
  return getImageUrl(qrPath);
};
