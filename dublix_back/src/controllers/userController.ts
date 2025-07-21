// src/controllers/userController.ts

import { Request, Response } from 'express';
import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = '12345678';

export async function createUser(req: Request, res: Response) {
  console.log('Données reçues:', req.body);
  try {
    const { nom, prenom, email, role, telephone, adresse } = req.body;

    if (!nom || !prenom || !email || !role) {
      res.status(400).json({ message: 'Champs obligatoires manquants (nom, prenom, email, role)' });
      return;
    }

    // Vérifier que seul un admin peut créer
    if (req.user?.role !== RoleType.ADMINISTRATEUR) {
      res.status(403).json({ message: 'Accès refusé - Seuls les administrateurs peuvent créer des utilisateurs' });
      return;
    }

    // Vérifier que le rôle est valide
    if (!Object.values(RoleType).includes(role as RoleType)) {
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
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Créer l'utilisateur
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: hashedPassword,
        role: role as RoleType,
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

  } catch (error) {
    console.error("Erreur dans createUser :", error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: (error as Error).message 
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, motDePasse } = req.body;

    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    const isValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isValid) {
      res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Si mot de passe est toujours le mot par défaut, forcer reset
    const forceReset = await bcrypt.compare(DEFAULT_PASSWORD, user.motDePasse);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({ token, forceReset });
  } catch (error) {
    console.error("Erreur dans loginUser :", error);
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { userId, nouveauMotDePasse } = req.body;

    if (!userId || !nouveauMotDePasse) {
      res.status(400).json({ message: 'Champs obligatoires manquants' });
      return;
    }

    const hashed = await bcrypt.hash(nouveauMotDePasse, 10);

    await prisma.utilisateur.update({
      where: { id: userId },
      data: { motDePasse: hashed },
    });

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    console.error("Erreur dans resetPassword :", error);
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}