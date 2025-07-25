-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMINISTRATEUR', 'TECHNICIEN', 'UTILISATEUR');

-- CreateEnum
CREATE TYPE "StatutEquipement" AS ENUM ('FONCTIONNEL', 'EN_PANNE', 'HORS_SERVICE');

-- CreateEnum
CREATE TYPE "TypeIntervention" AS ENUM ('MAINTENANCE', 'REPARATION', 'INSPECTION');

-- CreateEnum
CREATE TYPE "StatutNotification" AS ENUM ('NON_LUE', 'LUE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('CREATION_EQUIPEMENT', 'MODIFICATION_EQUIPEMENT', 'SIGNALEMENT_PANNE', 'INTERVENTION_PROGRAMMEE', 'INTERVENTION_TERMINEE');

-- CreateEnum
CREATE TYPE "StatutModification" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "role" "RoleType" NOT NULL,
    "telephone" VARCHAR(20),
    "adresse" TEXT,
    "photo" VARCHAR(255),
    "email" VARCHAR(150),
    "motDePasse" VARCHAR(255) NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "responsableId" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipements" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(200) NOT NULL,
    "modele" VARCHAR(150),
    "marque" VARCHAR(100),
    "numeroSerie" VARCHAR(100),
    "presentation" TEXT,
    "serviceId" TEXT,
    "anneeFabrication" INTEGER,
    "statut" "StatutEquipement" NOT NULL DEFAULT 'FONCTIONNEL',
    "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateInstallation" DATE,
    "dateDerniereIntervention" TIMESTAMP(3),
    "nombreExemplaires" INTEGER NOT NULL DEFAULT 1,
    "qrcode" VARCHAR(255) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dateModification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_interventions" (
    "id" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "dateSignalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateIntervention" TIMESTAMP(3),
    "signalePar" TEXT,
    "intervenantId" TEXT,
    "typeIntervention" "TypeIntervention",
    "pannesSignalees" TEXT,
    "pannesConstatees" TEXT,
    "diagnosticsPoses" TEXT,
    "piecesRechange" TEXT,
    "statutApresIntervention" "StatutEquipement",
    "conclusions" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL,
    "interventionValidee" BOOLEAN NOT NULL DEFAULT false,
    "valideeParId" TEXT,

    CONSTRAINT "historique_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "typeNotification" VARCHAR(50),
    "statut" "StatutNotification" NOT NULL DEFAULT 'NON_LUE',
    "equipementId" TEXT,
    "interventionId" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLecture" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "typeEvenement" "TypeEvenement" NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "dateEvenement" TIMESTAMP(3) NOT NULL,
    "equipementId" TEXT,
    "interventionId" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rappelActive" BOOLEAN NOT NULL DEFAULT false,
    "dateRappel" TIMESTAMP(3),

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifications_en_attente" (
    "id" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "technicienId" TEXT NOT NULL,
    "champsModifies" JSONB NOT NULL,
    "datedemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutModification" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaireTechnicien" TEXT,
    "valideeParId" TEXT,
    "dateValidation" TIMESTAMP(3),
    "commentaireValidation" TEXT,

    CONSTRAINT "modifications_en_attente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "services_nom_key" ON "services"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "equipements_numeroSerie_key" ON "equipements"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "equipements_qrcode_key" ON "equipements"("qrcode");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipements" ADD CONSTRAINT "equipements_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipements" ADD CONSTRAINT "equipements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipements" ADD CONSTRAINT "equipements_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_interventions" ADD CONSTRAINT "historique_interventions_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_interventions" ADD CONSTRAINT "historique_interventions_signalePar_fkey" FOREIGN KEY ("signalePar") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_interventions" ADD CONSTRAINT "historique_interventions_intervenantId_fkey" FOREIGN KEY ("intervenantId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_interventions" ADD CONSTRAINT "historique_interventions_valideeParId_fkey" FOREIGN KEY ("valideeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "historique_interventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "historique_interventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifications_en_attente" ADD CONSTRAINT "modifications_en_attente_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifications_en_attente" ADD CONSTRAINT "modifications_en_attente_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifications_en_attente" ADD CONSTRAINT "modifications_en_attente_valideeParId_fkey" FOREIGN KEY ("valideeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
