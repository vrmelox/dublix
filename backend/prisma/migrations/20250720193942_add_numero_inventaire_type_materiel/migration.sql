-- AlterTable
ALTER TABLE "equipements" ADD COLUMN     "numeroInventaire" VARCHAR(100),
ADD COLUMN     "typeMateriel" VARCHAR(150);

-- CreateIndex
CREATE INDEX "equipements_numeroInventaire_idx" ON "equipements"("numeroInventaire");

-- CreateIndex
CREATE INDEX "equipements_typeMateriel_idx" ON "equipements"("typeMateriel");
