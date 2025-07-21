import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImageService } from '../services/imageService';
import { QRCodeService } from '../services/qrCodeService';
import { FileUtils } from '../utils/fileUtils';

const prisma = new PrismaClient();

export class EquipmentController {
  /**
   * Créer un nouvel équipement
   */
  static async createEquipment(req: Request, res: Response) {
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
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const {
        nom,
        modele,
        services,
        installationDate,
        description,
        numeroInventaire, // Ce champ n'existe pas dans le schéma
        typeMateriel,     // Ce champ n'existe pas dans le schéma
        numeroSerie,
        marque,
        anneeFabrication
      } = req.body;

      console.log("✅ Données parsées:", {
        nom, modele, services, installationDate, description,
        numeroInventaire, typeMateriel, numeroSerie, marque, anneeFabrication
      });

      // Validation des champs obligatoires selon le schéma Prisma
      if (!nom || !modele || !numeroSerie || !marque || !anneeFabrication) {
        console.log("❌ Champs obligatoires manquants");
        res.status(400).json({ 
          error: 'Champs obligatoires manquants',
          required: ['nom', 'modele', 'numeroSerie', 'marque', 'anneeFabrication'],
          missing: {
            nom: !nom,
            modele: !modele,
            numeroSerie: !numeroSerie,
            marque: !marque,
            anneeFabrication: !anneeFabrication
          }
        });
        return;
      }

      // Vérification du fichier image
      if (!req.file) {
        console.log("❌ Aucune image uploadée");
        res.status(400).json({ error: 'Image requise' });
        return;
      }

      console.log("✅ Validation des champs réussie");

      // Vérifier l'unicité du numéro de série
      const existingEquipment = await prisma.equipement.findUnique({
        where: { numeroSerie }
      });

      if (existingEquipment) {
        console.log("❌ Numéro de série déjà existant:", numeroSerie);
        res.status(400).json({ 
          error: 'Un équipement avec ce numéro de série existe déjà' 
        });
        return;
      }

      console.log("✅ Numéro de série unique");

      // L'image est déjà sauvegardée par multer, on utilise le chemin relatif
      const imagePath = `uploads/equipments/${req.file.filename}`;
      console.log("📸 Chemin image:", imagePath);

      // Parser les services si c'est une string JSON
      let servicesArray: string[] = [];
      if (typeof services === 'string') {
        try {
          servicesArray = JSON.parse(services);
          console.log("📊 Services parsés:", servicesArray);
        } catch {
          servicesArray = [services];
          console.log("📊 Service unique:", servicesArray);
        }
      } else if (Array.isArray(services)) {
        servicesArray = services;
        console.log("📊 Services array:", servicesArray);
      }

      console.log("🗄️ Création en base de données...");

      // Générer un QR code unique temporaire
      const tempQrCode = `temp_qr_${Date.now()}`;

      // Créer l'équipement selon le schéma Prisma
      const equipement = await prisma.equipement.create({
        data: {
          nom,
          modele: modele,                                    // Champ correct selon le schéma
          marque,
          numeroSerie,
          numeroInventaire: numeroInventaire || null,        // ✨ Nouveau champ
          typeMateriel: typeMateriel || null,               // ✨ Nouveau champ
          presentation: description || '',                   // description → presentation
          anneeFabrication: parseInt(anneeFabrication),
          dateInstallation: installationDate ? new Date(installationDate) : new Date(),
          dateDerniereIntervention: new Date(),
          photo: imagePath,
          lien: `${process.env.CLIENT_URL || 'http://localhost:3000'}/equipment/`,
          qrcode: tempQrCode,                               // QR code temporaire unique
          createdBy: req.user.id,
          updatedBy: req.user.id,
          // serviceId peut être ajouté plus tard si on gère les services
          // serviceId: null, 
        },
      });

      console.log("✅ Équipement créé en base:", equipement.id);

      // Générer le QR code réel
      console.log("📱 Génération du QR code...");
      const qrCodePath = await QRCodeService.generateEquipmentQRCode(equipement.id);
      console.log("✅ QR code généré:", qrCodePath);

      // Mettre à jour l'équipement avec le QR code réel
      const updatedEquipement = await prisma.equipement.update({
        where: { id: equipement.id },
        data: { 
          qrcode: qrCodePath,
          lien: `${process.env.CLIENT_URL || 'http://localhost:3000'}/equipment/${equipement.id}`
        },
      });

      console.log("🎉 Équipement finalisé avec QR code");

      res.status(201).json({
        message: 'Équipement créé avec succès',
        equipement: updatedEquipement
      });

    } catch (error) {
      console.error('💥 Erreur lors de la création de l\'équipement:', error);
      
      // Nettoyer l'image en cas d'erreur
      if (req.file?.path) {
        try {
          await FileUtils.deleteFile(req.file.path);
          console.log("🗑️ Image nettoyée après erreur");
        } catch (cleanupError) {
          console.error("⚠️ Erreur lors du nettoyage:", cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: 'Erreur interne du serveur lors de la création de l\'équipement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupérer tous les équipements
   */
  static async getAllEquipments(req: Request, res: Response) {
    console.log("📋 Récupération de tous les équipements");
    try {
      const { page = 1, limit = 10, search, service, statut } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      // Filtrage par recherche
      if (search) {
        where.OR = [
          { nom: { contains: search as string, mode: 'insensitive' } },
          { modele: { contains: search as string, mode: 'insensitive' } },
          { marque: { contains: search as string, mode: 'insensitive' } },
          { numeroSerie: { contains: search as string, mode: 'insensitive' } },
          { numeroInventaire: { contains: search as string, mode: 'insensitive' } }, // ✨ Nouveau
          { typeMateriel: { contains: search as string, mode: 'insensitive' } }      // ✨ Nouveau
        ];
        console.log("🔍 Recherche appliquée:", search);
      }
      
      // Filtrage par statut
      if (statut && ['FONCTIONNEL', 'EN_PANNE', 'HORS_SERVICE'].includes(statut as string)) {
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
            service: true,
            createurUtilisateur: {
              select: { nom: true, prenom: true }
            }
          }
        }),
        prisma.equipement.count({ where })
      ]);

      console.log(`✅ ${equipements.length} équipements trouvés sur ${total} au total`);

      res.json({
        equipements,
        pagination: {
          total,
          totalPages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          limit: Number(limit)
        }
      });

    } catch (error) {
      console.error('💥 Erreur lors de la récupération des équipements:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Récupérer un équipement par ID
   */
  static async getEquipmentById(req: Request, res: Response) {
    console.log("🔍 Récupération équipement par ID:", req.params.id);
    try {
      const { id } = req.params;

      const equipement = await prisma.equipement.findUnique({
        where: { id },
        include: {
          service: true,
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
        res.status(404).json({ error: 'Équipement non trouvé' });
        return;
      }

      console.log("✅ Équipement trouvé:", equipement.nom);
      res.json(equipement);

    } catch (error) {
      console.error('💥 Erreur lors de la récupération de l\'équipement:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Mettre à jour un équipement
   */
  static async updateEquipment(req: Request, res: Response) {
    console.log("🔄 Mise à jour équipement:", req.params.id);
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
      }

      const { id } = req.params;
      const updateData: any = {};

      // Mapper les champs du body vers les champs du schéma Prisma
      if (req.body.nom) updateData.nom = req.body.nom;
      if (req.body.modele) updateData.modele = req.body.modele;
      if (req.body.marque) updateData.marque = req.body.marque;
      if (req.body.numeroSerie) updateData.numeroSerie = req.body.numeroSerie;
      if (req.body.numeroInventaire !== undefined) updateData.numeroInventaire = req.body.numeroInventaire || null; // ✨ Nouveau
      if (req.body.typeMateriel !== undefined) updateData.typeMateriel = req.body.typeMateriel || null;             // ✨ Nouveau
      if (req.body.description) updateData.presentation = req.body.description;
      if (req.body.anneeFabrication) updateData.anneeFabrication = parseInt(req.body.anneeFabrication);
      if (req.body.installationDate) updateData.dateInstallation = new Date(req.body.installationDate);
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
        res.status(404).json({ error: 'Équipement non trouvé' });
        return;
      }

      // Si un nouveau fichier est uploadé
      if (req.file) {
        console.log("📸 Nouvelle image uploadée");
        
        // Supprimer l'ancienne image
        await ImageService.deleteImage(existingEquipment.photo);
        
        // Utiliser le nouveau fichier sauvegardé par multer
        const imagePath = `uploads/equipments/${req.file.filename}`;
        updateData.photo = imagePath;
        console.log("✅ Chemin nouvelle image:", imagePath);
      }

      // Mettre à jour updatedBy
      updateData.updatedBy = req.user.id;

      console.log("🗄️ Mise à jour en base...");

      // Mettre à jour l'équipement
      const equipement = await prisma.equipement.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
          createurUtilisateur: {
            select: { nom: true, prenom: true }
          }
        }
      });

      console.log("✅ Équipement mis à jour avec succès");

      res.json({
        message: 'Équipement mis à jour avec succès',
        equipement
      });

    } catch (error) {
      console.error('💥 Erreur lors de la mise à jour de l\'équipement:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Supprimer un équipement
   */
  static async deleteEquipment(req: Request, res: Response) {
    console.log("🗑️ Suppression équipement:", req.params.id);
    try {
      const { id } = req.params;

      // Vérifier si l'équipement existe
      const equipement = await prisma.equipement.findUnique({
        where: { id }
      });

      if (!equipement) {
        console.log("❌ Équipement non trouvé pour suppression");
        res.status(404).json({ error: 'Équipement non trouvé' });
        return;
      }

      console.log("🗑️ Suppression des fichiers associés...");

      // Supprimer les fichiers associés
      await Promise.all([
        ImageService.deleteImage(equipement.photo),
        QRCodeService.deleteQRCode(equipement.qrcode)
      ]);

      console.log("🗄️ Suppression en base de données...");

      // Supprimer l'équipement de la base de données
      await prisma.equipement.delete({
        where: { id }
      });

      console.log("✅ Équipement supprimé avec succès");

      res.json({ message: 'Équipement supprimé avec succès' });

    } catch (error) {
      console.error('💥 Erreur lors de la suppression de l\'équipement:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Générer un nouveau QR code pour un équipement
   */
  static async regenerateQRCode(req: Request, res: Response) {
    console.log("📱 Régénération QR code pour:", req.params.id);
    try {
      const { id } = req.params;

      const equipement = await prisma.equipement.findUnique({
        where: { id }
      });

      if (!equipement) {
        console.log("❌ Équipement non trouvé pour régénération QR");
        res.status(404).json({ error: 'Équipement non trouvé' });
        return;
      }

      // Supprimer l'ancien QR code
      if (equipement.qrcode) {
        console.log("🗑️ Suppression ancien QR code");
        await QRCodeService.deleteQRCode(equipement.qrcode);
      }

      // Générer un nouveau QR code
      console.log("🆕 Génération nouveau QR code");
      const qrCodePath = await QRCodeService.generateEquipmentQRCode(id);

      // Mettre à jour l'équipement
      await prisma.equipement.update({
        where: { id },
        data: { qrcode: qrCodePath }
      });

      console.log("✅ QR code régénéré:", qrCodePath);

      res.json({
        message: 'QR code régénéré avec succès',
        qrcode: qrCodePath
      });

    } catch (error) {
      console.error('💥 Erreur lors de la régénération du QR code:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * Obtenir le QR code en base64
   */
  static async getQRCodeBase64(req: Request, res: Response) {
    console.log("📱 Génération QR code base64 pour:", req.params.id);
    try {
      const { id } = req.params;

      const qrCodeBase64 = await QRCodeService.generateQRCodeBase64(id);

      console.log("✅ QR code base64 généré");

      res.json({
        qrcode: qrCodeBase64
      });

    } catch (error) {
      console.error('💥 Erreur lors de la génération du QR code base64:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
}