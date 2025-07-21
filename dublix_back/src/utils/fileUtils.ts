import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export class FileUtils {
  /**
   * Génère un nom de fichier unique
   */
  static generateUniqueFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    return `${uniqueId}_${timestamp}${extension}`;
  }

  /**
   * Vérifie si un fichier existe
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Supprime un fichier
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      if (await this.fileExists(filePath)) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
    }
  }

  /**
   * Crée un répertoire s'il n'existe pas
   */
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Erreur lors de la création du répertoire ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Valide les extensions de fichiers autorisées
   */
  static isValidImageExtension(fileName: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = path.extname(fileName).toLowerCase();
    return validExtensions.includes(extension);
  }
}