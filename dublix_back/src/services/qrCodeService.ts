import QRCode from 'qrcode';
import path from 'path';
import { FileUtils } from '../utils/fileUtils';

export class QRCodeService {
  private static readonly QR_DIR = path.resolve('public/uploads/qrcodes');
  private static readonly BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';

  /**
   * Génère un QR code pour un équipement
   */
  static async generateEquipmentQRCode(equipmentId: string): Promise<string> {
    try {
      // Créer le répertoire si nécessaire
      await FileUtils.ensureDirectoryExists(this.QR_DIR);

      // URL vers la page de l'équipement
      const equipmentUrl = `${this.BASE_URL}/equipment/${equipmentId}`;

      // Nom du fichier QR code
      const qrFileName = `qr_${equipmentId}_${Date.now()}.png`;
      const qrFilePath = path.join(this.QR_DIR, qrFileName);

      // Générer le QR code
      await QRCode.toFile(qrFilePath, equipmentUrl, {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200,
        margin: 2
      });

      // Retourner le chemin relatif
      return `uploads/qrcodes/${qrFileName}`;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw new Error('Échec de la génération du QR code');
    }
  }

  /**
   * Supprime un QR code
   */
  static async deleteQRCode(qrCodePath: string): Promise<void> {
    try {
      const fullPath = path.resolve('public', qrCodePath);
      await FileUtils.deleteFile(fullPath);
    } catch (error) {
      console.error('Erreur lors de la suppression du QR code:', error);
    }
  }

  /**
   * Génère un QR code en base64 (pour affichage direct)
   */
  static async generateQRCodeBase64(equipmentId: string): Promise<string> {
    try {
      const equipmentUrl = `${this.BASE_URL}/equipment/${equipmentId}`;
      return await QRCode.toDataURL(equipmentUrl, {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200,
        margin: 2
      });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code base64:', error);
      throw new Error('Échec de la génération du QR code');
    }
  }
}