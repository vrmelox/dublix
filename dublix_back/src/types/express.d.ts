declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nom: string;
        prenom: string;
        email: string | null; // Allow null to match Prisma schema
        role: 'ADMIN' | 'UTILISATEUR' | 'TECHNICIEN'; // Use the actual enum values
        actif: boolean;
      };
    }
  }
}
