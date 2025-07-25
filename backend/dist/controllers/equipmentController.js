"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentController = void 0;
const client_1 = require("@prisma/client");
const imageService_1 = require("../services/imageService");
const qrCodeService_1 = require("../services/qrCodeService");
const fileUtils_1 = require("../utils/fileUtils");
const prisma = new client_1.PrismaClient();
class EquipmentController {
    /**
     * Créer un nouvel équipement
     */
    static async createEquipment(req, res) {
        console.log("🚀 Début création équipement");
        console.log("📋 Body reçu:", req.body);
        console.log("📎 Fichier reçu:", req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path
        } : 'Aucun fichier');
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Non authentifié'
                });
                return;
            }
            const { nom, modele, services, installationDate, description, numeroInventaire, typeMateriel, numeroSerie, marque, anneeFabrication } = req.body;
            console.log("✅ Données parsées:", {
                nom, modele, services, installationDate, description,
                numeroInventaire, typeMateriel, numeroSerie, marque, anneeFabrication
            });
            // Validation des champs obligatoires
            if (!nom || !modele || !numeroSerie || !marque || !anneeFabrication) {
                console.log("❌ Champs obligatoires manquants");
                res.status(400).json({
                    success: false,
                    error: 'Champs obligatoires manquants',
                    code: 'MISSING_REQUIRED_FIELDS',
                    details: {
                        required: ['nom', 'modele', 'numeroSerie', 'marque', 'anneeFabrication'],
                        missing: {
                            nom: !nom,
                            modele: !modele,
                            numeroSerie: !numeroSerie,
                            marque: !marque,
                            anneeFabrication: !anneeFabrication
                        }
                    }
                });
                return;
            }
            // Vérification du fichier image
            if (!req.file) {
                console.log("❌ Aucune image uploadée");
                res.status(400).json({
                    success: false,
                    error: 'Image requise',
                    code: 'MISSING_FILE'
                });
                return;
            }
            console.log("✅ Validation des champs réussie");
            // 🆕 PARSER LES SERVICES
            let servicesArray = [];
            if (typeof services === 'string') {
                try {
                    servicesArray = JSON.parse(services);
                    console.log("📊 Services parsés depuis JSON:", servicesArray);
                }
                catch {
                    servicesArray = [services];
                    console.log("📊 Service unique:", servicesArray);
                }
            }
            else if (Array.isArray(services)) {
                servicesArray = services;
                console.log("📊 Services array:", servicesArray);
            }
            // Validation des services
            if (servicesArray.length === 0) {
                console.log("❌ Aucun service sélectionné");
                res.status(400).json({
                    success: false,
                    error: 'Au moins un service doit être sélectionné',
                    code: 'NO_SERVICES_SELECTED'
                });
                return;
            }
            // Vérifier l'unicité du numéro de série
            const existingEquipment = await prisma.equipement.findUnique({
                where: { numeroSerie }
            });
            if (existingEquipment) {
                console.log("❌ Numéro de série déjà existant:", numeroSerie);
                res.status(400).json({
                    success: false,
                    error: 'Un équipement avec ce numéro de série existe déjà',
                    code: 'DUPLICATE_SERIAL_NUMBER',
                    details: {
                        field: 'numeroSerie',
                        value: numeroSerie
                    }
                });
                return;
            }
            console.log("✅ Numéro de série unique");
            // L'image est déjà sauvegardée par multer
            const imagePath = `uploads/equipments/${req.file.filename}`;
            console.log("📸 Chemin image:", imagePath);
            // 🆕 TRAITER LES SERVICES
            let serviceIds = [];
            let servicePrincipalId = null;
            if (servicesArray.length > 0) {
                console.log("🔍 Recherche des services en base...");
                // Chercher les services existants
                const existingServices = await prisma.service.findMany({
                    where: {
                        nom: {
                            in: servicesArray
                        }
                    }
                });
                console.log(`✅ ${existingServices.length} services trouvés en base`);
                serviceIds = existingServices.map(s => s.id);
                // Le premier service devient le service principal pour compatibilité
                if (existingServices.length > 0) {
                    servicePrincipalId = existingServices[0].id;
                    console.log("👑 Service principal défini:", existingServices[0].nom);
                }
                // Créer les services manquants
                const existingServiceNames = existingServices.map(s => s.nom);
                const missingServices = servicesArray.filter(name => !existingServiceNames.includes(name));
                if (missingServices.length > 0) {
                    console.log("🆕 Création des services manquants:", missingServices);
                    const newServices = await Promise.all(missingServices.map(nom => prisma.service.create({
                        data: {
                            nom,
                            description: `Service créé automatiquement: ${nom}`
                        }
                    })));
                    serviceIds.push(...newServices.map(s => s.id));
                    // Si pas de service principal défini, utiliser le premier nouveau service
                    if (!servicePrincipalId && newServices.length > 0) {
                        servicePrincipalId = newServices[0].id;
                        console.log("👑 Service principal défini (nouveau):", newServices[0].nom);
                    }
                    console.log(`✅ ${newServices.length} nouveaux services créés`);
                }
            }
            console.log(`📊 Total ${serviceIds.length} services à associer`);
            // Générer un QR code unique temporaire
            const tempQrCode = `temp_qr_${Date.now()}`;
            console.log("🗄️ Création en base de données...");
            // 🆕 CRÉER L'ÉQUIPEMENT AVEC LES SERVICES
            const equipement = await prisma.equipement.create({
                data: {
                    nom,
                    modele,
                    marque,
                    numeroSerie,
                    numeroInventaire: numeroInventaire || null,
                    typeMateriel: typeMateriel || null,
                    presentation: description || '',
                    serviceId: servicePrincipalId, // Service principal pour compatibilité
                    anneeFabrication: parseInt(anneeFabrication),
                    dateInstallation: installationDate ? new Date(installationDate) : new Date(),
                    dateDerniereIntervention: new Date(),
                    photo: imagePath,
                    lien: `${process.env.CLIENT_URL || 'https://bioqrsuivi.com'}/equipment/`,
                    qrcode: tempQrCode,
                    createdBy: req.user.id,
                    updatedBy: req.user.id,
                    // 🆕 CRÉER LES RELATIONS AVEC LES SERVICES
                    services: {
                        create: serviceIds.map((serviceId, index) => ({
                            serviceId,
                            principal: index === 0 // Le premier service est marqué comme principal
                        }))
                    }
                },
                include: {
                    service: true, // Service principal pour compatibilité
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            });
            console.log("✅ Équipement créé en base:", equipement.id);
            console.log("📊 Services associés:", equipement.services.map(s => s.service.nom));
            // Générer le QR code réel
            console.log("📱 Génération du QR code...");
            const qrCodePath = await qrCodeService_1.QRCodeService.generateEquipmentQRCode(equipement.id);
            console.log("✅ QR code généré:", qrCodePath);
            // Mettre à jour l'équipement avec le QR code réel
            const updatedEquipement = await prisma.equipement.update({
                where: { id: equipement.id },
                data: {
                    qrcode: qrCodePath,
                    lien: `${process.env.CLIENT_URL || 'https://bioqrsuivi.com'}/equipment/${equipement.id}`
                },
                include: {
                    service: true,
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            });
            console.log("🎉 Équipement finalisé avec QR code et services");
            res.status(201).json({
                success: true,
                message: 'Équipement créé avec succès',
                equipement: {
                    ...updatedEquipement,
                    // 🆕 Ajouter les noms des services pour le frontend
                    serviceNames: updatedEquipement.services.map(s => s.service.nom)
                }
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la création de l\'équipement:', error);
            // Nettoyer l'image en cas d'erreur
            if (req.file?.path) {
                try {
                    await fileUtils_1.FileUtils.deleteFile(req.file.path);
                    console.log("🗑️ Image nettoyée après erreur");
                }
                catch (cleanupError) {
                    console.error("⚠️ Erreur lors du nettoyage:", cleanupError);
                }
            }
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur lors de la création de l\'équipement',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Récupérer tous les équipements
     */
    static async getAllEquipments(req, res) {
        console.log("📋 Récupération de tous les équipements");
        try {
            const { page = 1, limit = 10, search, service, statut } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            // Filtrage par recherche
            if (search) {
                where.OR = [
                    { nom: { contains: search, mode: 'insensitive' } },
                    { modele: { contains: search, mode: 'insensitive' } },
                    { marque: { contains: search, mode: 'insensitive' } },
                    { numeroSerie: { contains: search, mode: 'insensitive' } },
                    { numeroInventaire: { contains: search, mode: 'insensitive' } },
                    { typeMateriel: { contains: search, mode: 'insensitive' } }
                ];
                console.log("🔍 Recherche appliquée:", search);
            }
            // Filtrage par statut
            if (statut && ['FONCTIONNEL', 'EN_PANNE', 'HORS_SERVICE'].includes(statut)) {
                where.statut = statut;
                console.log("📊 Filtre statut appliqué:", statut);
            }
            console.log("🗄️ Requête database...");
            const [equipements, total] = await Promise.all([
                prisma.equipement.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { dateAjout: 'desc' },
                    include: {
                        service: true, // Service principal
                        services: {
                            include: {
                                service: true
                            }
                        },
                        createurUtilisateur: {
                            select: { nom: true, prenom: true }
                        }
                    }
                }),
                prisma.equipement.count({ where })
            ]);
            console.log(`✅ ${equipements.length} équipements trouvés sur ${total} au total`);
            // 🆕 Transformer les données pour inclure les noms des services
            const equipementsWithServices = equipements.map(eq => ({
                ...eq,
                serviceNames: eq.services.map(s => s.service.nom), // Liste des noms de services
                allServices: eq.services.map(s => s.service) // Détails complets des services
            }));
            res.json({
                success: true,
                equipements: equipementsWithServices,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                    currentPage: Number(page),
                    limit: Number(limit)
                }
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la récupération des équipements:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Récupérer un équipement par ID
     */
    static async getEquipmentById(req, res) {
        console.log("🔍 Récupération équipement par ID:", req.params.id);
        try {
            const { id } = req.params;
            const equipement = await prisma.equipement.findUnique({
                where: { id },
                include: {
                    service: true, // Service principal
                    services: {
                        include: {
                            service: true
                        }
                    },
                    createurUtilisateur: {
                        select: { nom: true, prenom: true, email: true }
                    },
                    modificateurUtilisateur: {
                        select: { nom: true, prenom: true, email: true }
                    },
                    historiqueInterventions: {
                        orderBy: { dateSignalement: 'desc' },
                        take: 5,
                        include: {
                            signalantUtilisateur: {
                                select: { nom: true, prenom: true }
                            },
                            intervenantUtilisateur: {
                                select: { nom: true, prenom: true }
                            }
                        }
                    }
                }
            });
            if (!equipement) {
                console.log("❌ Équipement non trouvé");
                res.status(404).json({
                    success: false,
                    error: 'Équipement non trouvé',
                    code: 'EQUIPMENT_NOT_FOUND'
                });
                return;
            }
            console.log("✅ Équipement trouvé:", equipement.nom);
            console.log("📊 Services associés:", equipement.services.map(s => s.service.nom));
            // 🆕 Ajouter les noms des services
            const equipementWithServices = {
                ...equipement,
                serviceNames: equipement.services.map(s => s.service.nom),
                allServices: equipement.services.map(s => s.service)
            };
            res.json({
                success: true,
                equipement: equipementWithServices
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la récupération de l\'équipement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Mettre à jour un équipement
     */
    static async updateEquipment(req, res) {
        console.log("🔄 Mise à jour équipement:", req.params.id);
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Non authentifié'
                });
                return;
            }
            const { id } = req.params;
            const updateData = {};
            // Mapper les champs du body vers les champs du schéma Prisma
            if (req.body.nom)
                updateData.nom = req.body.nom;
            if (req.body.modele)
                updateData.modele = req.body.modele;
            if (req.body.marque)
                updateData.marque = req.body.marque;
            if (req.body.numeroSerie)
                updateData.numeroSerie = req.body.numeroSerie;
            if (req.body.numeroInventaire !== undefined)
                updateData.numeroInventaire = req.body.numeroInventaire || null;
            if (req.body.typeMateriel !== undefined)
                updateData.typeMateriel = req.body.typeMateriel || null;
            if (req.body.description)
                updateData.presentation = req.body.description;
            if (req.body.anneeFabrication)
                updateData.anneeFabrication = parseInt(req.body.anneeFabrication);
            if (req.body.installationDate)
                updateData.dateInstallation = new Date(req.body.installationDate);
            if (req.body.statut && ['FONCTIONNEL', 'EN_PANNE', 'HORS_SERVICE'].includes(req.body.statut)) {
                updateData.statut = req.body.statut;
            }
            console.log("📋 Données de mise à jour:", updateData);
            // Vérifier si l'équipement existe
            const existingEquipment = await prisma.equipement.findUnique({
                where: { id }
            });
            if (!existingEquipment) {
                console.log("❌ Équipement non trouvé pour mise à jour");
                res.status(404).json({
                    success: false,
                    error: 'Équipement non trouvé',
                    code: 'EQUIPMENT_NOT_FOUND'
                });
                return;
            }
            // Si un nouveau fichier est uploadé
            if (req.file) {
                console.log("📸 Nouvelle image uploadée");
                // Supprimer l'ancienne image
                await imageService_1.ImageService.deleteImage(existingEquipment.photo);
                // Utiliser le nouveau fichier sauvegardé par multer
                const imagePath = `uploads/equipments/${req.file.filename}`;
                updateData.photo = imagePath;
                console.log("✅ Chemin nouvelle image:", imagePath);
            }
            // 🆕 GESTION DES SERVICES POUR LA MISE À JOUR
            let serviceUpdates = {};
            if (req.body.services) {
                let servicesArray = [];
                if (typeof req.body.services === 'string') {
                    try {
                        servicesArray = JSON.parse(req.body.services);
                    }
                    catch {
                        servicesArray = [req.body.services];
                    }
                }
                else if (Array.isArray(req.body.services)) {
                    servicesArray = req.body.services;
                }
                if (servicesArray.length > 0) {
                    console.log("🔄 Mise à jour des services:", servicesArray);
                    // Traiter les services comme dans createEquipment
                    const existingServices = await prisma.service.findMany({
                        where: {
                            nom: {
                                in: servicesArray
                            }
                        }
                    });
                    let serviceIds = existingServices.map(s => s.id);
                    // Créer les services manquants
                    const existingServiceNames = existingServices.map(s => s.nom);
                    const missingServices = servicesArray.filter(name => !existingServiceNames.includes(name));
                    if (missingServices.length > 0) {
                        const newServices = await Promise.all(missingServices.map(nom => prisma.service.create({
                            data: {
                                nom,
                                description: `Service créé automatiquement: ${nom}`
                            }
                        })));
                        serviceIds.push(...newServices.map(s => s.id));
                    }
                    // Mettre à jour le service principal
                    if (serviceIds.length > 0) {
                        updateData.serviceId = serviceIds[0];
                    }
                    // Préparer la mise à jour des relations services
                    serviceUpdates.services = {
                        deleteMany: {}, // Supprimer toutes les relations existantes
                        create: serviceIds.map((serviceId, index) => ({
                            serviceId,
                            principal: index === 0
                        }))
                    };
                }
            }
            // Mettre à jour updatedBy
            updateData.updatedBy = req.user.id;
            console.log("🗄️ Mise à jour en base...");
            // Mettre à jour l'équipement avec ou sans services
            const equipement = await prisma.equipement.update({
                where: { id },
                data: {
                    ...updateData,
                    ...serviceUpdates
                },
                include: {
                    service: true,
                    services: {
                        include: {
                            service: true
                        }
                    },
                    createurUtilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            });
            console.log("✅ Équipement mis à jour avec succès");
            res.json({
                success: true,
                message: 'Équipement mis à jour avec succès',
                equipement: {
                    ...equipement,
                    serviceNames: equipement.services.map(s => s.service.nom),
                    allServices: equipement.services.map(s => s.service)
                }
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la mise à jour de l\'équipement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Supprimer un équipement
     */
    static async deleteEquipment(req, res) {
        console.log("🗑️ Suppression équipement:", req.params.id);
        try {
            const { id } = req.params;
            // Vérifier si l'équipement existe
            const equipement = await prisma.equipement.findUnique({
                where: { id }
            });
            if (!equipement) {
                console.log("❌ Équipement non trouvé pour suppression");
                res.status(404).json({
                    success: false,
                    error: 'Équipement non trouvé',
                    code: 'EQUIPMENT_NOT_FOUND'
                });
                return;
            }
            console.log("🗑️ Suppression des fichiers associés...");
            // Supprimer les fichiers associés
            await Promise.all([
                imageService_1.ImageService.deleteImage(equipement.photo),
                qrCodeService_1.QRCodeService.deleteQRCode(equipement.qrcode)
            ]);
            console.log("🗄️ Suppression en base de données...");
            // Supprimer l'équipement de la base de données
            // Les relations services seront supprimées automatiquement grâce à onDelete: Cascade
            await prisma.equipement.delete({
                where: { id }
            });
            console.log("✅ Équipement supprimé avec succès");
            res.json({
                success: true,
                message: 'Équipement supprimé avec succès'
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la suppression de l\'équipement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Générer un nouveau QR code pour un équipement
     */
    static async regenerateQRCode(req, res) {
        console.log("📱 Régénération QR code pour:", req.params.id);
        try {
            const { id } = req.params;
            const equipement = await prisma.equipement.findUnique({
                where: { id }
            });
            if (!equipement) {
                console.log("❌ Équipement non trouvé pour régénération QR");
                res.status(404).json({
                    success: false,
                    error: 'Équipement non trouvé',
                    code: 'EQUIPMENT_NOT_FOUND'
                });
                return;
            }
            // Supprimer l'ancien QR code
            if (equipement.qrcode) {
                console.log("🗑️ Suppression ancien QR code");
                await qrCodeService_1.QRCodeService.deleteQRCode(equipement.qrcode);
            }
            // Générer un nouveau QR code
            console.log("🆕 Génération nouveau QR code");
            const qrCodePath = await qrCodeService_1.QRCodeService.generateEquipmentQRCode(id);
            // Mettre à jour l'équipement
            await prisma.equipement.update({
                where: { id },
                data: { qrcode: qrCodePath }
            });
            console.log("✅ QR code régénéré:", qrCodePath);
            res.json({
                success: true,
                message: 'QR code régénéré avec succès',
                qrcode: qrCodePath
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la régénération du QR code:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Obtenir le QR code en base64
     */
    static async getQRCodeBase64(req, res) {
        console.log("📱 Génération QR code base64 pour:", req.params.id);
        try {
            const { id } = req.params;
            const qrCodeBase64 = await qrCodeService_1.QRCodeService.generateQRCodeBase64(id);
            console.log("✅ QR code base64 généré");
            res.json({
                success: true,
                qrcode: qrCodeBase64
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la génération du QR code base64:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
       * Signaler une panne d'équipement
       */
    static async reportBreakdown(req, res) {
        console.log("🚨 Signalement de panne pour équipement:", req.params.id);
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Non authentifié'
                });
                return;
            }
            const { id } = req.params;
            const { problemType, details } = req.body;
            // Validation des données
            if (!problemType || !details) {
                console.log("❌ Données manquantes pour signalement");
                res.status(400).json({
                    success: false,
                    error: 'Type de problème et détails requis',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
                return;
            }
            if (!['panne', 'hors service'].includes(problemType)) {
                console.log("❌ Type de problème invalide:", problemType);
                res.status(400).json({
                    success: false,
                    error: 'Type de problème invalide',
                    code: 'INVALID_PROBLEM_TYPE'
                });
                return;
            }
            // Vérifier que l'équipement existe
            const equipement = await prisma.equipement.findUnique({
                where: { id },
                include: {
                    service: true,
                    services: {
                        include: {
                            service: true
                        }
                    }
                }
            });
            if (!equipement) {
                console.log("❌ Équipement non trouvé pour signalement");
                res.status(404).json({
                    success: false,
                    error: 'Équipement non trouvé',
                    code: 'EQUIPMENT_NOT_FOUND'
                });
                return;
            }
            console.log("✅ Équipement trouvé:", equipement.nom);
            // Déterminer le nouveau statut
            const nouveauStatut = problemType === 'panne' ? 'EN_PANNE' : 'HORS_SERVICE';
            // Créer une intervention de signalement
            console.log("📝 Création de l'intervention de signalement...");
            const intervention = await prisma.historiqueIntervention.create({
                data: {
                    equipementId: id,
                    dateSignalement: new Date(),
                    dateIntervention: null, // Pas encore d'intervention
                    signalePar: req.user.id,
                    intervenantId: null, // Sera assigné plus tard
                    typeIntervention: null, // Sera défini lors de l'intervention
                    pannesSignalees: details,
                    pannesConstatees: null,
                    diagnosticsPoses: null,
                    piecesRechange: null,
                    statutApresIntervention: null,
                    conclusions: null,
                    interventionValidee: false,
                    valideeParId: null
                },
                include: {
                    signalantUtilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            });
            console.log("✅ Intervention de signalement créée:", intervention.id);
            // Mettre à jour le statut de l'équipement
            console.log(`🔄 Mise à jour du statut: ${equipement.statut} → ${nouveauStatut}`);
            const equipementMisAJour = await prisma.equipement.update({
                where: { id },
                data: {
                    statut: nouveauStatut,
                    updatedBy: req.user.id,
                    dateModification: new Date()
                }
            });
            // Importer le service de notifications
            const { NotificationService } = await Promise.resolve().then(() => __importStar(require('../services/notificationService')));
            // Envoyer des notifications aux administrateurs et techniciens
            console.log("📧 Envoi des notifications de signalement...");
            try {
                const signalantName = intervention.signalantUtilisateur
                    ? `${intervention.signalantUtilisateur.prenom} ${intervention.signalantUtilisateur.nom}`
                    : req.user.email || 'Utilisateur inconnu';
                await NotificationService.notifyBreakdownReport(id, equipement.nom, signalantName, details);
                console.log("✅ Notifications de panne envoyées");
            }
            catch (notificationError) {
                console.error("⚠️ Erreur envoi notifications (non bloquant):", notificationError);
                // On continue même si les notifications échouent
            }
            // Créer un événement
            console.log("📅 Création de l'événement...");
            try {
                await prisma.evenement.create({
                    data: {
                        utilisateurId: req.user.id,
                        typeEvenement: 'SIGNALEMENT_PANNE',
                        titre: `Panne signalée - ${equipement.nom}`,
                        description: `Type: ${problemType}. Détails: ${details}`,
                        dateEvenement: new Date(),
                        equipementId: id,
                        interventionId: intervention.id
                    }
                });
                console.log("✅ Événement créé");
            }
            catch (eventError) {
                console.error("⚠️ Erreur création événement (non bloquant):", eventError);
                // On continue même si l'événement échoue
            }
            console.log("🎉 Signalement de panne traité avec succès");
            res.status(201).json({
                success: true,
                message: `Panne signalée avec succès. L'équipement est maintenant marqué comme ${nouveauStatut.toLowerCase().replace('_', ' ')}.`,
                data: {
                    equipement: {
                        id: equipementMisAJour.id,
                        nom: equipementMisAJour.nom,
                        statut: equipementMisAJour.statut
                    },
                    intervention: {
                        id: intervention.id,
                        dateSignalement: intervention.dateSignalement,
                        pannesSignalees: intervention.pannesSignalees
                    },
                    problemType,
                    nouveauStatut
                }
            });
        }
        catch (error) {
            console.error('💥 Erreur lors du signalement de panne:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur lors du signalement de panne',
                code: 'INTERNAL_SERVER_ERROR',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
}
exports.EquipmentController = EquipmentController;
