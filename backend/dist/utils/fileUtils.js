"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class FileUtils {
    /**
     * Génère un nom de fichier unique
     */
    static generateUniqueFileName(originalName) {
        const extension = path_1.default.extname(originalName);
        const uniqueId = (0, uuid_1.v4)();
        const timestamp = Date.now();
        return `${uniqueId}_${timestamp}${extension}`;
    }
    /**
     * Vérifie si un fichier existe
     */
    static async fileExists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Supprime un fichier
     */
    static async deleteFile(filePath) {
        try {
            if (await this.fileExists(filePath)) {
                await promises_1.default.unlink(filePath);
            }
        }
        catch (error) {
            console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
        }
    }
    /**
     * Crée un répertoire s'il n'existe pas
     */
    static async ensureDirectoryExists(dirPath) {
        try {
            await promises_1.default.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            console.error(`Erreur lors de la création du répertoire ${dirPath}:`, error);
            throw error;
        }
    }
    /**
     * Valide les extensions de fichiers autorisées
     */
    static isValidImageExtension(fileName) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const extension = path_1.default.extname(fileName).toLowerCase();
        return validExtensions.includes(extension);
    }
}
exports.FileUtils = FileUtils;
