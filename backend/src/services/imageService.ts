import sharp from 'sharp';
import path from 'path';
import { FileUtils } from '../utils/fileUtils';

export class ImageService {
  private static readonly UPLOAD_DIR = path.resolve('public/uploads/equipments');
  private static readonly MAX_WIDTH = 800;
  private static readonly MAX_HEIGHT = 600;
  private static readonly QUALITY = 85;

  /**
   * Traite et sauvegarde une image depuis un buffer
   */
  static async processAndSaveImage(
    buffer: Buffer,
    originalName: string
  ): Promise<string> {
    try {
      // Créer le répertoire si nécessaire
      await FileUtils.ensureDirectoryExists(this.UPLOAD_DIR);

      // Générer un nom unique
      const uniqueFileName = FileUtils.generateUniqueFileName(originalName);
      const filePath = path.join(this.UPLOAD_DIR, uniqueFileName);

      // Traiter l'image avec Sharp
      await sharp(buffer)
        .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.QUALITY })
        .toFile(filePath);

      // Retourner le chemin relatif pour la base de données
      return `uploads/equipments/${uniqueFileName}`;
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      throw new Error('Échec du traitement de l\'image');
    }
  }

  /**
   * Traite et optimise une image déjà sauvegardée par multer
   */
  static async processExistingImage(filePath: string): Promise<string> {
    try {
      const tempPath = filePath + '_temp';
      
      // Optimiser l'image existante
      await sharp(filePath)
        .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.QUALITY })
        .toFile(tempPath);

      // Remplacer l'original par la version optimisée
      await FileUtils.deleteFile(filePath);
      const fs = require('fs').promises;
      await fs.rename(tempPath, filePath);

      return filePath;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de l\'image:', error);
      throw new Error('Échec de l\'optimisation de l\'image');
    }
  }

  /**
   * Supprime une image
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.resolve('public', imagePath);
      await FileUtils.deleteFile(fullPath);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
    }
  }
}