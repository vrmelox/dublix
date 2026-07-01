# Résidu d'audit : Vulnérabilité PostCSS dans Next.js 16

**Cause** :
Après avoir mis à jour Next.js à `^16`, `npm audit` remonte encore 2 vulnérabilités de sévérité **modérée** liées à `postcss < 8.5.10`. Cette version de PostCSS est **embarquée à l'intérieur du bundle interne de Next.js** — ce n'est pas un package que nous gérons directement.

**Action effectuée** :
Analyse de la correction suggérée par npm :
```
fix available via npm audit fix --force
Will install next@9.3.3, which is a breaking change
```
→ La "correction" proposée est de **rétrograder Next.js à la version 9** pour satisfaire la contrainte de PostCSS. Ce serait une régression catastrophique (perte de 7 années de développement du framework).

**Décision prise** : Ne pas appliquer `npm audit fix --force`. Ces 2 vulnérabilités sont **acceptées temporairement** car :
1. La faille PostCSS en question (XSS via `</style>`) ne s'applique qu'à du **rendu côté serveur de CSS non-validé** — ce n'est pas notre cas d'usage.
2. Next.js 16 est en phase de stabilisation et un correctif intégrant `postcss ≥ 8.5.10` sera publié dans une prochaine release.
3. L'alternative (rétrograder) est inacceptable.

**Conséquence attendue** :
Le projet est à jour au maximum possible sans rétrograder. Les vulnérabilités restantes sont documentées, maîtrisées et à surveiller lors de la prochaine mise à jour de Next.js.

**Précision** :
Cette situation est fréquente dans l'écosystème npm : des dépendances **transitives** (embarquées dans un paquet tiers) peuvent présenter des CVE que le projet ne peut pas corriger lui-même. La bonne pratique est de les documenter et de surveiller les releases du package parent (ici Next.js).
