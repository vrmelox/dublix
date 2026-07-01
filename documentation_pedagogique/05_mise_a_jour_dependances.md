# Choix Technique : Mise à jour des dépendances (npm update)

**Cause** :
Le projet avait plus d'un an sans mise à jour. Les dépendances npm vieillissent vite : des correctifs de sécurité, des optimisations de performances ou des corrections de bugs sont publiés régulièrement par les mainteneurs de librairies. Ignorer ces mises à jour expose le projet à des failles connues et à une dette technique croissante.

**Action effectuée** :
Exécution de `npm update` dans les dossiers `backend` et `frontend`. Cette commande met à jour chaque paquet vers la dernière version **compatible** avec la fourchette définie dans `package.json` (ex : `^6.0.0` → met à jour jusqu'à `6.x.x` mais pas vers `7.x.x`). Elle ne touche donc pas aux versions **majeures**.

**Conséquence attendue** :
Les paquets mineurs sont à jour. Les correctifs de bugs et petites améliorations de performance sont intégrés, sans risque de rupture de l'API existante.

**Précision — ⚠️ Avertissements importants remontés par npm :**

Trois alertes critiques ont été détectées lors de la mise à jour du frontend :

| Paquet | Problème | Priorité |
|---|---|---|
| `next@15.3.2` | **Faille de sécurité CVE-2025-66478** | 🔴 Critique |
| `@fortawesome/react-fontawesome@0.2.6` | Version dépréciée, non maintenue | 🟠 Urgent |
| `recharts@2.15.4` | Version `2.x` dépréciée, migration vers `3.x` recommandée | 🟠 Urgent |

Ces trois paquets **nécessitent une mise à jour vers une version majeure supérieure** — ce qui implique une adaptation du code. La prochaine étape consiste à les traiter un par un (voir document `06_maj_paquets_majeurs.md`).
