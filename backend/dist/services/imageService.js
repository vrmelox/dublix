"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fileUtils_1 = require("../utils/fileUtils");
class ImageService {
    /**
     * Traite et sauvegarde une image depuis un buffer
     */
    static async processAndSaveImage(buffer, originalName) {
        try {
            // Créer le répertoire si nécessaire
            await fileUtils_1.FileUtils.ensureDirectoryExists(this.UPLOAD_DIR);
            // Générer un nom unique
            const uniqueFileName = fileUtils_1.FileUtils.generateUniqueFileName(originalName);
            const filePath = path_1.default.join(this.UPLOAD_DIR, uniqueFileName);
            // Traiter l'image avec Sharp
            await (0, sharp_1.default)(buffer)
                .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: this.QUALITY })
                .toFile(filePath);
            // Retourner le chemin relatif pour la base de données
            return `uploads/equipments/${uniqueFileName}`;
        }
        catch (error) {
            console.error('Erreur lors du traitement de l\'image:', error);
            throw new Error('Échec du traitement de l\'image');
        }
    }
    /**
     * Traite et optimise une image déjà sauvegardée par multer
     */
    static async processExistingImage(filePath) {
        try {
            const tempPath = filePath + '_temp';
            // Optimiser l'image existante
            await (0, sharp_1.default)(filePath)
                .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: this.QUALITY })
                .toFile(tempPath);
            // Remplacer l'original par la version optimisée
            await fileUtils_1.FileUtils.deleteFile(filePath);
            const fs = require('fs').promises;
            await fs.rename(tempPath, filePath);
            return filePath;
        }
        catch (error) {
            console.error('Erreur lors de l\'optimisation de l\'image:', error);
            throw new Error('Échec de l\'optimisation de l\'image');
        }
    }
    /**
     * Supprime une image
     */
    static async deleteImage(imagePath) {
        try {
            const fullPath = path_1.default.resolve('public', imagePath);
            await fileUtils_1.FileUtils.deleteFile(fullPath);
        }
        catch (error) {
            console.error('Erreur lors de la suppression de l\'image:', error);
        }
    }
}
exports.ImageService = ImageService;
ImageService.UPLOAD_DIR = path_1.default.resolve('public/uploads/equipments');
ImageService.MAX_WIDTH = 800;
ImageService.MAX_HEIGHT = 600;
ImageService.QUALITY = 85;
