/*
  Warnings:

  - Added the required column `lien` to the `equipements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `equipements` table without a default value. This is not possible if the table is not empty.
  - Made the column `modele` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `marque` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numeroSerie` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `presentation` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `anneeFabrication` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateInstallation` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateDerniereIntervention` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdBy` on table `equipements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedBy` on table `equipements` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "equipements" DROP CONSTRAINT "equipements_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "equipements" DROP CONSTRAINT "equipements_updatedBy_fkey";

-- AlterTable
ALTER TABLE "equipements" ADD COLUMN     "lien" VARCHAR(255) NOT NULL,
ADD COLUMN     "photo" VARCHAR(255) NOT NULL,
ALTER COLUMN "modele" SET NOT NULL,
ALTER COLUMN "marque" SET NOT NULL,
ALTER COLUMN "numeroSerie" SET NOT NULL,
ALTER COLUMN "presentation" SET NOT NULL,
ALTER COLUMN "anneeFabrication" SET NOT NULL,
ALTER COLUMN "dateInstallation" SET NOT NULL,
ALTER COLUMN "dateDerniereIntervention" SET NOT NULL,
ALTER COLUMN "createdBy" SET NOT NULL,
ALTER COLUMN "updatedBy" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "equipements" ADD CONSTRAINT "equipements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipements" ADD CONSTRAINT "equipements_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
