#!/bin/bash

# Script SQL ultra-simple pour assigner des services
# Usage: ./simple_assign.sh

echo "🔧 Assignation rapide des services..."

# Exécuter les commandes SQL directement
sudo -u postgres psql dublix_db << 'EOF'

-- Créer les services de base
INSERT INTO services (id, nom, description, "dateCreation") VALUES 
    ('srv_nephro', 'Néphrologie et Hémodialyse', 'Service de néphrologie', NOW()),
    ('srv_rea', 'Réanimation', 'Service de réanimation', NOW()),
    ('srv_si', 'Soins Intensifs', 'Service de soins intensifs', NOW()),
    ('srv_urgences', 'Urgences', 'Service des urgences', NOW())
ON CONFLICT (nom) DO NOTHING;

-- Supprimer les anciennes relations (si elles existent)
DELETE FROM equipement_services;

-- Assigner "Néphrologie et Hémodialyse" + "Soins Intensifs" aux équipements de dialyse
INSERT INTO equipement_services (id, "equipementId", "serviceId", "dateAjout", principal)
SELECT 
    'es_' || substr(md5(random()::text), 1, 10),
    e.id,
    s.id,
    NOW(),
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.nom) = 1
FROM equipements e, services s
WHERE e.nom ~* '(dialyse|hémodialyse|générateur)' 
  AND s.nom IN ('Néphrologie et Hémodialyse', 'Soins Intensifs');

-- Assigner "Réanimation" + "Soins Intensifs" aux moniteurs
INSERT INTO equipement_services (id, "equipementId", "serviceId", "dateAjout", principal)
SELECT 
    'es_' || substr(md5(random()::text), 1, 10),
    e.id,
    s.id,
    NOW(),
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.nom) = 1
FROM equipements e, services s
WHERE e.nom ~* 'moniteur' 
  AND s.nom IN ('Réanimation', 'Soins Intensifs')
  AND NOT EXISTS (SELECT 1 FROM equipement_services es WHERE es."equipementId" = e.id);

-- Assigner "Réanimation" + "Urgences" aux concentrateurs d'oxygène
INSERT INTO equipement_services (id, "equipementId", "serviceId", "dateAjout", principal)
SELECT 
    'es_' || substr(md5(random()::text), 1, 10),
    e.id,
    s.id,
    NOW(),
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.nom) = 1
FROM equipements e, services s
WHERE e.nom ~* '(concentrateur|oxygène)' 
  AND s.nom IN ('Réanimation', 'Urgences')
  AND NOT EXISTS (SELECT 1 FROM equipement_services es WHERE es."equipementId" = e.id);

-- Assigner "Urgences" + "Soins Intensifs" aux autres équipements
INSERT INTO equipement_services (id, "equipementId", "serviceId", "dateAjout", principal)
SELECT 
    'es_' || substr(md5(random()::text), 1, 10),
    e.id,
    s.id,
    NOW(),
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.nom) = 1
FROM equipements e, services s
WHERE NOT EXISTS (SELECT 1 FROM equipement_services es WHERE es."equipementId" = e.id)
  AND s.nom IN ('Urgences', 'Soins Intensifs');

-- Mettre à jour le serviceId principal pour compatibilité
UPDATE equipements 
SET "serviceId" = (
    SELECT es."serviceId" 
    FROM equipement_services es 
    WHERE es."equipementId" = equipements.id 
      AND es.principal = true 
    LIMIT 1
)
WHERE "serviceId" IS NULL;

-- Afficher les résultats
\echo '🎉 Résultats de l'\''assignation :'
\echo '================================'

SELECT 
    e.nom as "Équipement",
    string_agg(s.nom, ', ' ORDER BY es.principal DESC, s.nom) as "Services"
FROM equipements e
LEFT JOIN equipement_services es ON e.id = es."equipementId"
LEFT JOIN services s ON es."serviceId" = s.id
GROUP BY e.id, e.nom
ORDER BY e."dateAjout" DESC;

\echo ''
\echo '✅ Assignation terminée avec succès !'

EOF

echo ""
echo "🔍 Vérification via API..."

# Vérifier le résultat via l'API
curl -s http://localhost:4000/api/equipments | jq -r '
.equipements[]? | 
"✅ \(.nom) → \(.serviceNames | join(", "))"
' 2>/dev/null || echo "⚠️ API non disponible, mais la base de données a été mise à jour"

echo ""
echo "🎉 Terminé !"
