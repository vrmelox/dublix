import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { RoleType } from '@prisma/client';

// Interface pour les erreurs de validation
interface ValidationError {
  success: false;
  message: string;
  errors?: any[];
}

// Middleware générique de validation
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const response: ValidationError = {
        success: false,
        message: 'Données invalides',
        errors
      };

      res.status(400).json(response);
      return;
    }

    req.body = value;
    next();
  };
};

// Schémas de validation

// Validation pour la connexion
const authSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'any.required': 'L\'email est requis'
    }),
  motDePasse: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est requis'
    })
});

// Validation pour l'inscription
const registrationSchema = Joi.object({
  nom: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom est requis'
    }),
  prenom: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 100 caractères',
      'any.required': 'Le prénom est requis'
    }),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(150)
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'string.max': 'L\'email ne peut pas dépasser 150 caractères',
      'any.required': 'L\'email est requis'
    }),
  motDePasse: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
      'any.required': 'Le mot de passe est requis'
    }),
  role: Joi.string()
    .valid(...Object.values(RoleType))
    .required()
    .messages({
      'any.only': `Le rôle doit être l'un des suivants: ${Object.values(RoleType).join(', ')}`,
      'any.required': 'Le rôle est requis'
    }),
  telephone: Joi.string()
    .pattern(new RegExp('^[+]?[0-9\s\-\(\)]{8,20}$'))
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Format de téléphone invalide'
    }),
  adresse: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'L\'adresse ne peut pas dépasser 500 caractères'
    })
});

// Validation pour la mise à jour du profil
const profileUpdateSchema = Joi.object({
  nom: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
  prenom: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 100 caractères'
    }),
  telephone: Joi.string()
    .pattern(new RegExp('^[+]?[0-9\s\-\(\)]{8,20}$'))
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Format de téléphone invalide'
    }),
  adresse: Joi.string()
    .max(500)
    .allow(null, '')
    .messages({
      'string.max': 'L\'adresse ne peut pas dépasser 500 caractères'
    })
}).min(1).messages({
  'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
});

// Validation pour le changement de mot de passe
const passwordChangeSchema = Joi.object({
  ancienMotDePasse: Joi.string()
    .required()
    .messages({
      'any.required': 'L\'ancien mot de passe est requis'
    }),
  nouveauMotDePasse: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .invalid(Joi.ref('ancienMotDePasse'))
    .required()
    .messages({
      'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
      'any.invalid': 'Le nouveau mot de passe doit être différent de l\'ancien',
      'any.required': 'Le nouveau mot de passe est requis'
    }),
  confirmationMotDePasse: Joi.string()
    .valid(Joi.ref('nouveauMotDePasse'))
    .required()
    .messages({
      'any.only': 'La confirmation du mot de passe ne correspond pas',
      'any.required': 'La confirmation du mot de passe est requise'
    })
});

// Validation pour les équipements
const equipmentSchema = Joi.object({
  nom: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 200 caractères',
      'any.required': 'Le nom de l\'équipement est requis'
    }),
  modele: Joi.string()
    .max(150)
    .allow(null, '')
    .messages({
      'string.max': 'Le modèle ne peut pas dépasser 150 caractères'
    }),
  marque: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'La marque ne peut pas dépasser 100 caractères'
    }),
  numeroSerie: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      'string.max': 'Le numéro de série ne peut pas dépasser 100 caractères'
    }),
  presentation: Joi.string()
    .max(2000) // Environ 300 mots
    .allow(null, '')
    .messages({
      'string.max': 'La présentation ne peut pas dépasser 2000 caractères'
    }),
  serviceId: Joi.string()
    .uuid()
    .allow(null, ''),
  anneeFabrication: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .allow(null)
    .messages({
      'number.min': 'L\'année de fabrication ne peut pas être antérieure à 1900',
      'number.max': `L'année de fabrication ne peut pas être supérieure à ${new Date().getFullYear()}`
    }),
  dateInstallation: Joi.date()
    .allow(null),
  nombreExemplaires: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Le nombre d\'exemplaires doit être au moins 1'
    })
});

// Export des middlewares de validation
export const validateAuth = validate(authSchema);
export const validateRegistration = validate(registrationSchema);
export const validateProfileUpdate = validate(profileUpdateSchema);
export const validatePasswordChange = validate(passwordChangeSchema);
export const validateEquipment = validate(equipmentSchema);