#!/bin/bash

echo "🗑️  SUPPRESSION DE TOUS LES ÉQUIPEMENTS"
echo "======================================"
echo ""
echo "⚠️  ATTENTION: Cette opération supprimera TOUS les équipements et leurs données associées !"
echo "📊 Base de données: dublix_db"
echo ""

read -p "Êtes-vous sûr de vouloir continuer ? (tapez 'OUI' pour confirmer): " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo "❌ Opération annulée."
    exit 1
fi

echo ""
echo "🚀 Début de la suppression..."

# Exécuter le script SQL de suppression
sudo -u postgres psql dublix_db << 'EOF'
-- Afficher le nombre d'équipements avant suppression
SELECT COUNT(*) as "Equipements avant suppression" FROM equipements;

-- Supprimer les données dépendantes
DELETE FROM modifications_en_attente WHERE equipementId IN (SELECT id FROM equipements);
DELETE FROM evenements WHERE equipementId IN (SELECT id FROM equipements);
DELETE FROM notifications WHERE equipementId IN (SELECT id FROM equipements);
DELETE FROM notifications WHERE interventionId IN (
    SELECT id FROM historique_interventions WHERE equipementId IN (SELECT id FROM equipements)
);
DELETE FROM evenements WHERE interventionId IN (
    SELECT id FROM historique_interventions WHERE equipementId IN (SELECT id FROM equipements)
);
DELETE FROM historique_interventions WHERE equipementId IN (SELECT id FROM equipements);

-- Supprimer tous les équipements
DELETE FROM equipements;

-- Vérifications
SELECT COUNT(*) as "Equipements après suppression" FROM equipements;
SELECT COUNT(*) as "Interventions restantes" FROM historique_interventions;
SELECT COUNT(*) as "Notifications équipements restantes" FROM notifications WHERE equipementId IS NOT NULL;

SELECT 'SUPPRESSION TERMINÉE ✅' as "Statut", NOW() as "Date";
EOF

echo ""
echo "✅ Suppression terminée !"
echo ""
echo "🧹 Pour supprimer aussi les fichiers images et QR codes, exécutez :"
echo "   sudo rm -rf /var/www/votre-app/frontend/public/uploads/equipments/*"
echo "   sudo rm -rf /var/www/votre-app/frontend/public/uploads/qrcodes/*"
