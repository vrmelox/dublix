"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fileUtils_1 = require("../utils/fileUtils");
class QRCodeService {
    /**
     * Génère un QR code pour un équipement
     */
    static async generateEquipmentQRCode(equipmentId) {
        try {
            // Créer le répertoire si nécessaire
            await fileUtils_1.FileUtils.ensureDirectoryExists(this.QR_DIR);
            // URL vers la page de l'équipement
            const equipmentUrl = `${this.BASE_URL}/equipment/${equipmentId}`;
            // Nom du fichier QR code
            const qrFileName = `qr_${equipmentId}_${Date.now()}.png`;
            const qrFilePath = path_1.default.join(this.QR_DIR, qrFileName);
            // Générer le QR code
            await qrcode_1.default.toFile(qrFilePath, equipmentUrl, {
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                width: 200,
                margin: 2
            });
            // Retourner le chemin relatif
            return `uploads/qrcodes/${qrFileName}`;
        }
        catch (error) {
            console.error('Erreur lors de la génération du QR code:', error);
            throw new Error('Échec de la génération du QR code');
        }
    }
    /**
     * Supprime un QR code
     */
    static async deleteQRCode(qrCodePath) {
        try {
            const fullPath = path_1.default.resolve('public', qrCodePath);
            await fileUtils_1.FileUtils.deleteFile(fullPath);
        }
        catch (error) {
            console.error('Erreur lors de la suppression du QR code:', error);
        }
    }
    /**
     * Génère un QR code en base64 (pour affichage direct)
     */
    static async generateQRCodeBase64(equipmentId) {
        try {
            const equipmentUrl = `${this.BASE_URL}/equipment/${equipmentId}`;
            return await qrcode_1.default.toDataURL(equipmentUrl, {
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                width: 200,
                margin: 2
            });
        }
        catch (error) {
            console.error('Erreur lors de la génération du QR code base64:', error);
            throw new Error('Échec de la génération du QR code');
        }
    }
}
exports.QRCodeService = QRCodeService;
QRCodeService.QR_DIR = path_1.default.resolve('public/uploads/qrcodes');
QRCodeService.BASE_URL = process.env.CLIENT_URL || 'https://bioqrsuivi.com';
