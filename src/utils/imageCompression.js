import imageCompression from 'browser-image-compression';

/**
 * Comprime uma imagem antes do upload.
 * @param {File} file - O arquivo de imagem original.
 * @returns {Promise<File>} - O arquivo de imagem comprimido.
 */
export const compressImage = async (file) => {
  if (!file) return null;
  
  // Se não for imagem (ex: pdf), retorna o arquivo original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5, // 500KB máximo, excelente equilíbrio entre qualidade e tamanho para web/mobile
    maxWidthOrHeight: 1280, // Largura ou altura máxima, suficiente para full HD sem pesar
    useWebWorker: true, // Usa background thread para não travar a UI
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Imagem reduzida de ${(file.size / 1024 / 1024).toFixed(2)} MB para ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Em caso de erro na compressão, retorna o arquivo original para não quebrar o fluxo
    return file;
  }
};
