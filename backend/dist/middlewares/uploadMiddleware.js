"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEquipmentImageUpload = exports.requirePhotoUpload = exports.handleUploadError = exports.uploadEquipmentImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fileUtils_1 = require("../utils/fileUtils");
// Configuration du stockage sur disque
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Chemin absolu vers dossier public/uploads/equipments
        cb(null, path_1.default.join(process.cwd(), 'public/uploads/equipments'));
    },
    filename: (req, file, cb) => {
        // Générer un nom unique avec timestamp + extension originale
        const ext = path_1.default.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});
// Filtre pour accepter uniquement les images valides
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('FORMAT_INVALIDE'));
        return;
    }
    if (!fileUtils_1.FileUtils.isValidImageExtension(file.originalname)) {
        cb(new Error('EXTENSION_NON_AUTORISEE'));
        return;
    }
    cb(null, true);
};
// Limite de taille : 5MB max
exports.uploadEquipmentImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Un seul fichier
    },
}).single('photo');
// Messages d'erreur explicites
const getErrorMessage = (errorCode, originalMessage) => {
    const errorMessages = {
        'LIMIT_FILE_SIZE': '📁 Fichier trop volumineux ! La taille maximale autorisée est de 5MB. Veuillez compresser votre image ou choisir une image plus petite.',
        'LIMIT_FILE_COUNT': '📁 Trop de fichiers ! Vous ne pouvez uploader qu\'une seule image à la fois.',
        'LIMIT_UNEXPECTED_FILE': '📁 Champ de fichier inattendu ! Assurez-vous d\'utiliser le champ "photo".',
        'FORMAT_INVALIDE': '🖼️ Format de fichier non autorisé ! Seules les images sont acceptées (JPG, PNG, GIF, WebP).',
        'EXTENSION_NON_AUTORISEE': '📄 Extension de fichier non autorisée ! Utilisez uniquement: .jpg, .jpeg, .png, .gif, .webp',
        'MISSING_FILE': '📷 Aucune image sélectionnée ! Veuillez choisir une image à uploader.',
    };
    return errorMessages[errorCode] || `❌ Erreur d'upload: ${originalMessage || 'Erreur inconnue'}`;
};
// Middleware pour gérer les erreurs Multer avec messages explicites
const handleUploadError = (error, req, res, next) => {
    console.error('📤 Erreur d\'upload:', error);
    // Erreurs Multer spécifiques
    if (error instanceof multer_1.default.MulterError) {
        const message = getErrorMessage(error.code, error.message);
        res.status(400).json({
            success: false,
            error: message,
            code: error.code,
            details: {
                maxSize: '5MB',
                allowedFormats: ['JPG', 'PNG', 'GIF', 'WebP'],
                fieldName: 'photo'
            }
        });
        return;
    }
    // Erreurs de validation personnalisées
    if (error && error.message) {
        if (error.message === 'FORMAT_INVALIDE') {
            res.status(400).json({
                success: false,
                error: getErrorMessage('FORMAT_INVALIDE'),
                code: 'FORMAT_INVALIDE',
                details: {
                    allowedFormats: ['JPG', 'PNG', 'GIF', 'WebP']
                }
            });
            return;
        }
        if (error.message === 'EXTENSION_NON_AUTORISEE') {
            res.status(400).json({
                success: false,
                error: getErrorMessage('EXTENSION_NON_AUTORISEE'),
                code: 'EXTENSION_NON_AUTORISEE',
                details: {
                    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
                }
            });
            return;
        }
        // Erreurs anciennes (compatibilité)
        if (error.message.includes('image')) {
            res.status(400).json({
                success: false,
                error: '🖼️ ' + error.message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
    }
    // Erreur 413 (Request Entity Too Large) - souvent du serveur/nginx
    if (error.status === 413 || error.statusCode === 413) {
        res.status(413).json({
            success: false,
            error: '📁 Fichier trop volumineux ! Cette limite est imposée par le serveur. Taille maximale: 5MB.',
            code: 'SERVER_FILE_TOO_LARGE',
            details: {
                maxSize: '5MB',
                suggestion: 'Veuillez compresser votre image ou utiliser un format plus léger (JPEG au lieu de PNG)'
            }
        });
        return;
    }
    // Autres erreurs génériques
    next(error);
};
exports.handleUploadError = handleUploadError;
// Middleware pour vérifier la présence du fichier
const requirePhotoUpload = (req, res, next) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            error: getErrorMessage('MISSING_FILE'),
            code: 'MISSING_FILE',
            details: {
                fieldName: 'photo',
                required: true
            }
        });
        return;
    }
    next();
};
exports.requirePhotoUpload = requirePhotoUpload;
// Wrapper pour une gestion complète de l'upload
const handleEquipmentImageUpload = (req, res, next) => {
    (0, exports.uploadEquipmentImage)(req, res, (error) => {
        if (error) {
            (0, exports.handleUploadError)(error, req, res, next);
            return;
        }
        next();
    });
};
exports.handleEquipmentImageUpload = handleEquipmentImageUpload;
