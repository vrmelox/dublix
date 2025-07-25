"use strict";
// src/controllers/meController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getMe(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                telephone: true,
                photo: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erreur dans /me :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
