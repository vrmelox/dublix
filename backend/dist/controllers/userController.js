"use strict";
// src/controllers/userController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.resetPassword = resetPassword;
exports.getAllUsers = getAllUsers;
exports.getUsersByRole = getUsersByRole;
exports.getUserById = getUserById;
exports.getUserStats = getUserStats;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const DEFAULT_PASSWORD = '12345678';
async function createUser(req, res) {
    console.log('Données reçues:', req.body);
    try {
        const { nom, prenom, email, role, telephone, adresse } = req.body;
        if (!nom || !prenom || !email || !role) {
            res.status(400).json({ message: 'Champs obligatoires manquants (nom, prenom, email, role)' });
            return;
        }
        // Vérifier que seul un admin peut créer
        if (req.user?.role !== client_1.RoleType.ADMINISTRATEUR) {
            res.status(403).json({ message: 'Accès refusé - Seuls les administrateurs peuvent créer des utilisateurs' });
            return;
        }
        // Vérifier que le rôle est valide
        if (!Object.values(client_1.RoleType).includes(role)) {
            res.status(400).json({ message: 'Rôle invalide' });
            return;
        }
        // Vérifier si l'email existe déjà
        const existing = await prisma.utilisateur.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Email déjà utilisé' });
            return;
        }
        // Hacher le mot de passe par défaut
        const hashedPassword = await bcrypt_1.default.hash(DEFAULT_PASSWORD, 10);
        // Créer l'utilisateur
        const user = await prisma.utilisateur.create({
            data: {
                nom,
                prenom,
                email,
                motDePasse: hashedPassword,
                role: role,
                telephone: telephone || null,
                adresse: adresse || null,
            },
        });
        console.log('Utilisateur créé:', user);
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: user.id,
            motDePasseParDefaut: DEFAULT_PASSWORD
        });
    }
    catch (error) {
        console.error("Erreur dans createUser :", error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}
async function loginUser(req, res) {
    try {
        const { email, motDePasse } = req.body;
        const user = await prisma.utilisateur.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        const isValid = await bcrypt_1.default.compare(motDePasse, user.motDePasse);
        if (!isValid) {
            res.status(400).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        // Si mot de passe est toujours le mot par défaut, forcer reset
        const forceReset = await bcrypt_1.default.compare(DEFAULT_PASSWORD, user.motDePasse);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, forceReset });
    }
    catch (error) {
        console.error("Erreur dans loginUser :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}
async function resetPassword(req, res) {
    try {
        const { userId, nouveauMotDePasse } = req.body;
        if (!userId || !nouveauMotDePasse) {
            res.status(400).json({ message: 'Champs obligatoires manquants' });
            return;
        }
        const hashed = await bcrypt_1.default.hash(nouveauMotDePasse, 10);
        await prisma.utilisateur.update({
            where: { id: userId },
            data: { motDePasse: hashed },
        });
        res.json({ message: 'Mot de passe mis à jour' });
    }
    catch (error) {
        console.error("Erreur dans resetPassword :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}
// ========================
// 🆕 NOUVELLES FONCTIONS DE RÉCUPÉRATION
// ========================
/**
 * Récupérer tous les utilisateurs avec filtres
 */
async function getAllUsers(req, res) {
    console.log("👥 Récupération de tous les utilisateurs");
    try {
        const { page = 1, limit = 10, search, role, actif = 'true', sortBy = 'dateCreation', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        // Filtrage par recherche (nom, prénom, email)
        if (search) {
            where.OR = [
                { nom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
            console.log("🔍 Recherche appliquée:", search);
        }
        // Filtrage par rôle
        if (role && ['ADMINISTRATEUR', 'TECHNICIEN', 'UTILISATEUR'].includes(role)) {
            where.role = role;
            console.log("👤 Filtre rôle appliqué:", role);
        }
        // Filtrage par statut actif
        if (actif !== 'all') {
            where.actif = actif === 'true';
            console.log("📊 Filtre actif appliqué:", actif);
        }
        // Configuration du tri
        const orderBy = {};
        if (sortBy === 'nom') {
            orderBy.nom = sortOrder;
        }
        else if (sortBy === 'role') {
            orderBy.role = sortOrder;
        }
        else {
            orderBy.dateCreation = sortOrder;
        }
        console.log("🗄️ Requête database...");
        const [utilisateurs, total] = await Promise.all([
            prisma.utilisateur.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy,
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    role: true,
                    telephone: true,
                    adresse: true,
                    actif: true,
                    dateCreation: true,
                    dateModification: true,
                    // Compter les relations
                    _count: {
                        select: {
                            equipementsCreés: true,
                            interventionsRealisées: true,
                            servicesResponsables: true
                        }
                    }
                }
            }),
            prisma.utilisateur.count({ where })
        ]);
        console.log(`✅ ${utilisateurs.length} utilisateurs trouvés sur ${total} au total`);
        res.json({
            utilisateurs,
            pagination: {
                total,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                limit: Number(limit)
            },
            filters: {
                search: search || null,
                role: role || null,
                actif: actif || null
            }
        });
    }
    catch (error) {
        console.error('💥 Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}
/**
 * Récupérer les utilisateurs par rôle spécifique
 */
async function getUsersByRole(req, res) {
    console.log("👤 Récupération des utilisateurs par rôle:", req.params.role);
    try {
        const { role } = req.params;
        const { actif = 'true' } = req.query;
        // Vérifier que le rôle est valide
        if (!['ADMINISTRATEUR', 'TECHNICIEN', 'UTILISATEUR'].includes(role.toUpperCase())) {
            res.status(400).json({
                error: 'Rôle invalide',
                validRoles: ['ADMINISTRATEUR', 'TECHNICIEN', 'UTILISATEUR']
            });
            return;
        }
        const whereCondition = {
            role: role.toUpperCase()
        };
        if (actif !== 'all') {
            whereCondition.actif = actif === 'true';
        }
        const utilisateurs = await prisma.utilisateur.findMany({
            where: whereCondition,
            orderBy: { nom: 'asc' },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                telephone: true,
                actif: true,
                dateCreation: true,
                _count: {
                    select: {
                        equipementsCreés: true,
                        interventionsRealisées: true,
                        servicesResponsables: true
                    }
                }
            }
        });
        console.log(`✅ ${utilisateurs.length} ${role}(s) trouvé(s)`);
        res.json({
            role: role.toUpperCase(),
            count: utilisateurs.length,
            utilisateurs
        });
    }
    catch (error) {
        console.error('💥 Erreur lors de la récupération par rôle:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}
/**
 * Récupérer un utilisateur par ID
 */
async function getUserById(req, res) {
    console.log("🔍 Récupération utilisateur par ID:", req.params.id);
    try {
        const { id } = req.params;
        const utilisateur = await prisma.utilisateur.findUnique({
            where: { id: id },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                telephone: true,
                adresse: true,
                actif: true,
                dateCreation: true,
                dateModification: true,
                // Relations détaillées
                servicesResponsables: {
                    select: {
                        id: true,
                        nom: true,
                        description: true
                    }
                },
                equipementsCreés: {
                    take: 5,
                    orderBy: { dateAjout: 'desc' },
                    select: {
                        id: true,
                        nom: true,
                        modele: true,
                        statut: true,
                        dateAjout: true
                    }
                },
                interventionsRealisées: {
                    take: 5,
                    orderBy: { dateSignalement: 'desc' },
                    select: {
                        id: true,
                        typeIntervention: true,
                        dateSignalement: true,
                        dateIntervention: true,
                        equipement: {
                            select: {
                                nom: true,
                                modele: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        equipementsCreés: true,
                        interventionsRealisées: true,
                        servicesResponsables: true,
                        notifications: true
                    }
                }
            }
        });
        if (!utilisateur) {
            console.log("❌ Utilisateur non trouvé");
            res.status(404).json({ error: 'Utilisateur non trouvé' });
            return;
        }
        console.log("✅ Utilisateur trouvé:", `${utilisateur.prenom} ${utilisateur.nom}`);
        res.json(utilisateur);
    }
    catch (error) {
        console.error('💥 Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}
/**
 * Statistiques des utilisateurs
 */
async function getUserStats(req, res) {
    console.log("📊 Récupération des statistiques utilisateurs");
    try {
        const stats = await prisma.utilisateur.groupBy({
            by: ['role'],
            where: { actif: true },
            _count: {
                id: true
            }
        });
        const totalActifs = await prisma.utilisateur.count({
            where: { actif: true }
        });
        const totalInactifs = await prisma.utilisateur.count({
            where: { actif: false }
        });
        const statsFormatted = {
            total: totalActifs + totalInactifs,
            actifs: totalActifs,
            inactifs: totalInactifs,
            parRole: stats.reduce((acc, stat) => {
                acc[stat.role] = stat._count.id;
                return acc;
            }, {})
        };
        console.log("✅ Statistiques calculées:", statsFormatted);
        res.json(statsFormatted);
    }
    catch (error) {
        console.error('💥 Erreur lors du calcul des statistiques:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}
