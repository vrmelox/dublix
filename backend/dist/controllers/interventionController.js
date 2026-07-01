"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class InterventionController {
    /**
     * Créer une nouvelle intervention
     */
    static async createIntervention(req, res) {
        console.log("🚀 Début création intervention");
        console.log("📋 Body reçu:", req.body);
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Non authentifié' });
                return;
            }
            const { equipementId, typeIntervention, pannesConstatees, diagnosticsPoses, piecesRechange, statutApresIntervention, conclusions, interventionValidee, dateIntervention } = req.body;
            console.log("✅ Données parsées:", {
                equipementId,
                typeIntervention,
                pannesConstatees,
                diagnosticsPoses,
                statutApresIntervention,
                interventionValidee
            });
            // Validation des champs obligatoires
            if (!equipementId || !typeIntervention) {
                console.log("❌ Champs obligatoires manquants");
                res.status(400).json({
                    error: 'Champs obligatoires manquants',
                    required: ['equipementId', 'typeIntervention']
                });
                return;
            }
            // Vérifier que l'équipement existe
            const equipement = await prisma.equipement.findUnique({
                where: { id: equipementId }
            });
            if (!equipement) {
                console.log("❌ Équipement non trouvé:", equipementId);
                res.status(404).json({ error: 'Équipement non trouvé' });
                return;
            }
            console.log("✅ Équipement trouvé:", equipement.nom);
            // Créer l'intervention
            const intervention = await prisma.historiqueIntervention.create({
                data: {
                    equipementId,
                    dateSignalement: new Date(),
                    dateIntervention: dateIntervention ? new Date(dateIntervention) : new Date(),
                    signalePar: req.user.id,
                    intervenantId: req.user.id,
                    typeIntervention,
                    pannesConstatees,
                    diagnosticsPoses,
                    piecesRechange,
                    statutApresIntervention: statutApresIntervention || equipement.statut,
                    conclusions,
                    interventionValidee: req.user.role === 'ADMINISTRATEUR' ? interventionValidee : false,
                    valideeParId: req.user.role === 'ADMINISTRATEUR' && interventionValidee ? req.user.id : null
                },
                include: {
                    equipement: true,
                    signalantUtilisateur: {
                        select: { nom: true, prenom: true }
                    },
                    intervenantUtilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            });
            console.log("✅ Intervention créée:", intervention.id);
            // Mettre à jour le statut de l'équipement si nécessaire
            if (statutApresIntervention && statutApresIntervention !== equipement.statut) {
                console.log("🔄 Mise à jour du statut de l'équipement");
                await prisma.equipement.update({
                    where: { id: equipementId },
                    data: {
                        statut: statutApresIntervention,
                        dateDerniereIntervention: new Date()
                    }
                });
                console.log("✅ Statut équipement mis à jour:", statutApresIntervention);
            }
            // Créer une notification pour les administrateurs
            if (req.user.role === 'TECHNICIEN') {
                console.log("📧 Création de notifications pour les administrateurs");
                // Récupérer tous les administrateurs
                const admins = await prisma.utilisateur.findMany({
                    where: {
                        role: 'ADMINISTRATEUR',
                        actif: true
                    }
                });
                // Créer une notification pour chaque administrateur
                const notifications = await Promise.all(admins.map(admin => prisma.notification.create({
                    data: {
                        utilisateurId: admin.id,
                        titre: 'Nouvelle intervention à valider',
                        message: `Une intervention a été effectuée sur ${equipement.nom} par ${req.user?.email}`,
                        typeNotification: 'INTERVENTION',
                        equipementId: equipementId,
                        interventionId: intervention.id
                    }
                })));
                console.log(`✅ ${notifications.length} notifications créées`);
            }
            // Créer un événement
            await prisma.evenement.create({
                data: {
                    utilisateurId: req.user.id,
                    typeEvenement: 'INTERVENTION_TERMINEE',
                    titre: `Intervention sur ${equipement.nom}`,
                    description: `Type: ${typeIntervention}. ${conclusions || 'Pas de conclusion.'}`,
                    dateEvenement: new Date(),
                    equipementId: equipementId,
                    interventionId: intervention.id
                }
            });
            console.log("🎉 Intervention créée avec succès");
            res.status(201).json({
                message: 'Intervention créée avec succès',
                intervention
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la création de l\'intervention:', error);
            res.status(500).json({
                error: 'Erreur interne du serveur lors de la création de l\'intervention',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Récupérer toutes les interventions
     */
    static async getAllInterventions(req, res) {
        console.log("📋 Récupération de toutes les interventions");
        try {
            const { page = 1, limit = 10, equipementId, validees, typeIntervention } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            // Filtrage par équipement
            if (equipementId) {
                where.equipementId = equipementId;
                console.log("🔍 Filtre équipement appliqué:", equipementId);
            }
            // Filtrage par validation
            if (validees !== undefined) {
                where.interventionValidee = validees === 'true';
                console.log("📊 Filtre validation appliqué:", validees);
            }
            // Filtrage par type d'intervention
            if (typeIntervention && ['MAINTENANCE', 'REPARATION', 'INSPECTION'].includes(typeIntervention)) {
                where.typeIntervention = typeIntervention;
                console.log("🔧 Filtre type intervention appliqué:", typeIntervention);
            }
            console.log("🗄️ Requête database...");
            const [interventions, total] = await Promise.all([
                prisma.historiqueIntervention.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { dateSignalement: 'desc' },
                    include: {
                        equipement: {
                            select: { nom: true, modele: true, numeroSerie: true }
                        },
                        signalantUtilisateur: {
                            select: { nom: true, prenom: true }
                        },
                        intervenantUtilisateur: {
                            select: { nom: true, prenom: true }
                        },
                        validateurUtilisateur: {
                            select: { nom: true, prenom: true }
                        }
                    }
                }),
                prisma.historiqueIntervention.count({ where })
            ]);
            console.log(`✅ ${interventions.length} interventions trouvées sur ${total} au total`);
            res.json({
                interventions,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                    currentPage: Number(page),
                    limit: Number(limit)
                }
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la récupération des interventions:', error);
            res.status(500).json({
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Récupérer une intervention par ID
     */
    static async getInterventionById(req, res) {
        console.log("🔍 Récupération intervention par ID:", req.params.id);
        try {
            const { id } = req.params;
            const intervention = await prisma.historiqueIntervention.findUnique({
                where: { id: id },
                include: {
                    equipement: true,
                    signalantUtilisateur: {
                        select: { nom: true, prenom: true, email: true }
                    },
                    intervenantUtilisateur: {
                        select: { nom: true, prenom: true, email: true }
                    },
                    validateurUtilisateur: {
                        select: { nom: true, prenom: true, email: true }
                    }
                }
            });
            if (!intervention) {
                console.log("❌ Intervention non trouvée");
                res.status(404).json({ error: 'Intervention non trouvée' });
                return;
            }
            console.log("✅ Intervention trouvée");
            res.json(intervention);
        }
        catch (error) {
            console.error('💥 Erreur lors de la récupération de l\'intervention:', error);
            res.status(500).json({
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Valider une intervention (Administrateur uniquement)
     */
    static async validateIntervention(req, res) {
        console.log("✅ Validation intervention:", req.params.id);
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Non authentifié' });
                return;
            }
            if (req.user.role !== 'ADMINISTRATEUR') {
                console.log("❌ Accès refusé - rôle:", req.user.role);
                res.status(403).json({ error: 'Accès refusé. Administrateur uniquement.' });
                return;
            }
            const { id } = req.params;
            const intervention = await prisma.historiqueIntervention.findUnique({
                where: { id: id }
            });
            if (!intervention) {
                console.log("❌ Intervention non trouvée");
                res.status(404).json({ error: 'Intervention non trouvée' });
                return;
            }
            if (intervention.interventionValidee) {
                console.log("⚠️ Intervention déjà validée");
                res.status(400).json({ error: 'Cette intervention est déjà validée' });
                return;
            }
            const updatedIntervention = await prisma.historiqueIntervention.update({
                where: { id: id },
                data: {
                    interventionValidee: true,
                    valideeParId: req.user.id,
                    dateModification: new Date()
                },
                include: {
                    equipement: { select: { nom: true } },
                    intervenantUtilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            });
            console.log("✅ Intervention validée avec succès");
            // Créer une notification pour le technicien
            if (updatedIntervention.intervenantId) {
                await prisma.notification.create({
                    data: {
                        utilisateurId: updatedIntervention.intervenantId,
                        titre: 'Intervention validée',
                        message: `Votre intervention sur ${updatedIntervention.equipement.nom} a été validée`,
                        typeNotification: 'VALIDATION',
                        equipementId: updatedIntervention.equipementId,
                        interventionId: updatedIntervention.id
                    }
                });
                console.log("📧 Notification envoyée au technicien");
            }
            res.json({
                message: 'Intervention validée avec succès',
                intervention: updatedIntervention
            });
        }
        catch (error) {
            console.error('💥 Erreur lors de la validation de l\'intervention:', error);
            res.status(500).json({
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
    /**
     * Récupérer les interventions d'un équipement
     */
    static async getEquipmentInterventions(req, res) {
        console.log("📋 Récupération interventions pour équipement:", req.params.equipmentId);
        try {
            const { equipmentId } = req.params;
            const { limit = 10 } = req.query;
            const interventions = await prisma.historiqueIntervention.findMany({
                where: { equipementId: equipmentId },
                orderBy: { dateSignalement: 'desc' },
                take: Number(limit),
                include: {
                    signalantUtilisateur: {
                        select: { nom: true, prenom: true }
                    },
                    intervenantUtilisateur: {
                        select: { nom: true, prenom: true }
                    },
                    validateurUtilisateur: {
                        select: { nom: true, prenom: true }
                    }
                }
            });
            console.log(`✅ ${interventions.length} interventions trouvées`);
            res.json(interventions);
        }
        catch (error) {
            console.error('💥 Erreur lors de la récupération des interventions:', error);
            res.status(500).json({
                error: 'Erreur interne du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    }
}
exports.InterventionController = InterventionController;
