# Choix Technique : Mise à jour des paquets majeurs (breaking changes)

**Cause** :
Suite à l'exécution de `npm update`, trois paquets du frontend sont restés à des versions dépréciées ou vulnérables car `npm update` ne franchit jamais les versions majeures automatiquement. Il faut donc les mettre à jour manuellement en modifiant `package.json` et en ajustant le code qui les utilise si besoin.

**Action effectuée** :

### 1. `next` : 15.x → 16.x (Faille de sécurité CVE-2025-66478)
- **Risque** : Critique. Une vulnérabilité de sécurité connue est présente.
- **Commande** : `npm install next@latest`
- **Impact code** : Faible si le projet utilise l'App Router standard. À vérifier : `next.config.js`, les Server Components, et la configuration de Webpack/Turbopack.

### 2. `@fortawesome/react-fontawesome` : 0.2.x → 3.x
- **Risque** : Élevé. L'API a changé dans la v3 (compatibilité React 18+/19).
- **Commande** : `npm install @fortawesome/react-fontawesome@^3`
- **Impact code** : Vérifier que les `<FontAwesomeIcon>` restent fonctionnels avec les nouvelles versions des packages `@fortawesome/free-solid-svg-icons` etc.

### 3. `recharts` : 2.x → 3.x
- **Risque** : Moyen. Des props ont changé dans certains composants.
- **Commande** : `npm install recharts@latest`  
- **Impact code** : Vérifier les composants `<AreaChart>`, `<BarChart>`, etc. et consulter le guide de migration officiel.

**Conséquence attendue** :
Après ces mises à jour, le projet ne présente plus de vulnérabilité connue et utilise des versions activement maintenues pour la durée du cycle de vie prévu.

**Précision** :
Ces mises à jour majeures sont effectuées **avant** le premier lancement Docker afin d'éviter de construire des images avec du code vulnérable. C'est une bonne pratique de "shift-left security" (traiter les problèmes de sécurité le plus tôt possible dans le cycle de développement).
